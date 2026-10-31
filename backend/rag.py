"""
Retrieval over knowledge/profile.md.

The profile is split into one chunk per `##` heading. Retrieval is hybrid:
cosine similarity over embeddings (when an embedding model is configured)
blended with a lexical TF-IDF score. With no embedding model it degrades to
lexical-only, which is plenty for a profile of this size.

Embeddings are cached in knowledge/.embeddings_cache.json, keyed by a hash of
the chunk text and the embedding model, so the profile is only re-embedded
when it changes.
"""
from __future__ import annotations

import hashlib
import json
import logging
import math
import re
from dataclasses import dataclass, field
from pathlib import Path

import llm

log = logging.getLogger("rag")

KNOWLEDGE_DIR = Path(__file__).parent / "knowledge"
PROFILE_FILE = KNOWLEDGE_DIR / "profile.md"
CACHE_FILE = KNOWLEDGE_DIR / ".embeddings_cache.json"

# Chunks appended to every retrieval regardless of score. "Guidance for the
# assistant" holds answering rules, so main.py hides it from the visible sources.
ALWAYS_INCLUDE = ("Snapshot", "Guidance for the assistant")
HIDDEN_SOURCES = {"Guidance for the assistant"}

_TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9+#.\-]*")
_STOPWORDS = {
    "a", "an", "the", "and", "or", "of", "to", "in", "on", "for", "with", "is", "are", "was", "were",
    "be", "been", "it", "its", "this", "that", "these", "those", "as", "at", "by", "from", "has", "have",
    "had", "do", "does", "did", "what", "which", "who", "whom", "how", "when", "where", "why", "about",
    "tell", "me", "her", "she", "his", "he", "they", "them", "you", "your", "i", "we", "us", "can", "could",
    "would", "should", "will", "does", "any", "some", "there", "than", "then", "so", "if", "into", "also",
    "simran", "kapoor", "s", "please",
}


def _stem(token: str) -> str:
    """Very light normalisation so 'internships' matches 'internship', 'projects' matches 'project'."""
    if len(token) > 4 and token.endswith("ies"):
        return token[:-3] + "y"
    if len(token) > 3 and token.endswith("s") and not token.endswith("ss"):
        return token[:-1]
    return token


def tokenize(text: str) -> list[str]:
    out: list[str] = []
    for raw in _TOKEN_RE.findall(text.lower()):
        if raw in _STOPWORDS or len(raw) < 2:
            continue
        out.append(_stem(raw))
        # Also index the parts of dotted/hyphenated tokens: "dagar.io" -> "dagar", "io";
        # "nl-to-sql" -> "nl", "sql". The whole token stays so exact matches still score.
        if "." in raw or "-" in raw:
            for part in re.split(r"[.\-]", raw):
                if len(part) > 1 and part not in _STOPWORDS:
                    out.append(_stem(part))
    return out


@dataclass
class Chunk:
    title: str
    text: str
    tokens: list[str] = field(default_factory=list)
    tf: dict[str, float] = field(default_factory=dict)
    embedding: list[float] | None = None

    @property
    def key(self) -> str:
        return hashlib.sha256(self.text.encode("utf-8")).hexdigest()[:24]


def load_chunks(path: Path = PROFILE_FILE) -> list[Chunk]:
    raw = path.read_text(encoding="utf-8")
    chunks: list[Chunk] = []
    current_title: str | None = None
    buffer: list[str] = []

    def flush() -> None:
        if current_title is None:
            return
        body = "\n".join(buffer).strip()
        if body:
            chunks.append(Chunk(title=current_title, text=f"## {current_title}\n\n{body}"))

    for line in raw.splitlines():
        if line.startswith("## "):
            flush()
            current_title = line[3:].strip()
            buffer = []
        elif line.startswith("# "):
            continue  # document title, not a chunk
        else:
            if current_title is not None:
                buffer.append(line)
    flush()

    for chunk in chunks:
        chunk.tokens = tokenize(chunk.text)
        counts: dict[str, int] = {}
        for tok in chunk.tokens:
            counts[tok] = counts.get(tok, 0) + 1
        length = max(len(chunk.tokens), 1)
        chunk.tf = {tok: n / length for tok, n in counts.items()}
    return chunks


def _cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0


class Retriever:
    def __init__(self, path: Path = PROFILE_FILE):
        self.path = path
        self.chunks = load_chunks(path)
        self.idf = self._compute_idf()
        self.embedding_model = llm.embedding_model()
        self.semantic = False
        if self.embedding_model:
            try:
                self._load_embeddings()
                self.semantic = all(c.embedding is not None for c in self.chunks)
            except Exception as exc:  # network/auth errors: fall back to lexical
                log.warning("Embeddings unavailable, using lexical retrieval only: %s", exc)
        log.info("Loaded %d chunks (semantic=%s)", len(self.chunks), self.semantic)

    # ---------- lexical ----------
    def _compute_idf(self) -> dict[str, float]:
        n = len(self.chunks) or 1
        df: dict[str, int] = {}
        for chunk in self.chunks:
            for tok in set(chunk.tokens):
                df[tok] = df.get(tok, 0) + 1
        return {tok: math.log((n + 1) / (d + 0.5)) + 1.0 for tok, d in df.items()}

    def _lexical_scores(self, query: str) -> list[float]:
        q_tokens = tokenize(query)
        scores: list[float] = []
        for chunk in self.chunks:
            score = 0.0
            title_tokens = set(tokenize(chunk.title))
            for tok in q_tokens:
                if tok in chunk.tf:
                    score += chunk.tf[tok] * self.idf.get(tok, 1.0)
                if tok in title_tokens:
                    score += 0.15  # heading match is a strong signal
            scores.append(score)
        return scores

    # ---------- semantic ----------
    def _load_embeddings(self) -> None:
        cache: dict[str, list[float]] = {}
        if CACHE_FILE.exists():
            try:
                stored = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
                if stored.get("model") == self.embedding_model:
                    cache = stored.get("vectors", {})
            except json.JSONDecodeError:
                cache = {}

        missing = [c for c in self.chunks if c.key not in cache]
        if missing:
            vectors = llm.embed([c.text for c in missing])
            if vectors is None:
                return
            for chunk, vec in zip(missing, vectors):
                cache[chunk.key] = vec
            CACHE_FILE.write_text(
                json.dumps({"model": self.embedding_model, "vectors": cache}), encoding="utf-8"
            )
        for chunk in self.chunks:
            chunk.embedding = cache.get(chunk.key)

    # ---------- public ----------
    def retrieve(self, query: str, k: int = 4) -> list[tuple[Chunk, float]]:
        lexical = self._lexical_scores(query)
        max_lex = max(lexical) or 1.0
        combined = [s / max_lex for s in lexical]

        if self.semantic:
            try:
                q_vec = llm.embed([query])
            except Exception as exc:
                log.warning("Query embedding failed, lexical only: %s", exc)
                q_vec = None
            if q_vec:
                sims = [_cosine(q_vec[0], c.embedding or []) for c in self.chunks]
                combined = [0.7 * sim + 0.3 * lex for sim, lex in zip(sims, combined)]

        ranked = sorted(zip(self.chunks, combined), key=lambda pair: pair[1], reverse=True)
        top = [pair for pair in ranked[:k] if pair[1] > 0 and pair[0].title not in ALWAYS_INCLUDE]
        # Always include the snapshot (basic context) and the guidance (answering rules).
        for title in ALWAYS_INCLUDE:
            chunk = next((c for c in self.chunks if c.title == title), None)
            if chunk:
                top.append((chunk, 0.0))
        return top
