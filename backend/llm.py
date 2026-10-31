"""
LLM and embedding access for the portfolio assistant (GPT-4o).

Provider is picked by LLM_PROVIDER, or auto-detected from the env:
  azure   - Microsoft Foundry / Azure OpenAI (default when the Azure vars are set).
            AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT
            (the deployment *name*, default "gpt-4o"), optional
            AZURE_OPENAI_EMBEDDING_DEPLOYMENT. The client first uses the Foundry
            v1 route (<endpoint>/openai/v1/, no api-version) and falls back to
            the legacy Azure OpenAI route (api-version) on a 404. Set
            AZURE_OPENAI_LEGACY_API=true to use the legacy route from the start.
  openai  - OpenAI platform. OPENAI_API_KEY; OPENAI_CHAT_MODEL defaults to
            "gpt-4o", OPENAI_EMBEDDING_MODEL to "text-embedding-3-small".

Everything goes through the official `openai` SDK. If neither provider is
configured the server still boots, /api/health reports llm_configured=false,
and the frontend falls back to its browser-side answers.
"""
from __future__ import annotations

import logging
import os
import threading
from typing import Iterator
from urllib.parse import urlparse

from openai import AzureOpenAI, NotFoundError, OpenAI

log = logging.getLogger("llm")

DEFAULT_AZURE_API_VERSION = "2024-10-21"


def _env_bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in ("1", "true", "yes", "on")


def _env_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, default))
    except ValueError:
        return default


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except ValueError:
        return default


TEMPERATURE = _env_float("LLM_TEMPERATURE", 0.2)
MAX_TOKENS = _env_int("LLM_MAX_TOKENS", 600)


def provider() -> str:
    explicit = os.getenv("LLM_PROVIDER", "").strip().lower()
    if explicit in ("azure", "openai"):
        return explicit
    if os.getenv("AZURE_OPENAI_ENDPOINT") and os.getenv("AZURE_OPENAI_API_KEY"):
        return "azure"
    if os.getenv("OPENAI_API_KEY"):
        return "openai"
    return "none"


def _azure_endpoint() -> str:
    """Normalise AZURE_OPENAI_ENDPOINT to its origin.

    Foundry's "Target URI" is often pasted whole, e.g.
    https://my-resource.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=...
    Only the scheme and host are needed; both routes add their own paths.
    """
    raw = os.environ["AZURE_OPENAI_ENDPOINT"].strip()
    parsed = urlparse(raw if "://" in raw else f"https://{raw}")
    if not parsed.netloc:
        raise RuntimeError("AZURE_OPENAI_ENDPOINT is not a valid URL")
    return f"{parsed.scheme or 'https'}://{parsed.netloc}"


def _azure_v1_client() -> OpenAI:
    """Foundry v1 route: standard OpenAI client pointed at <endpoint>/openai/v1/."""
    return OpenAI(base_url=f"{_azure_endpoint()}/openai/v1/", api_key=os.environ["AZURE_OPENAI_API_KEY"])


def _azure_legacy_client() -> AzureOpenAI:
    return AzureOpenAI(
        azure_endpoint=_azure_endpoint(),
        api_key=os.environ["AZURE_OPENAI_API_KEY"],
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", DEFAULT_AZURE_API_VERSION),
    )


class _ClientHolder:
    """Lazily builds the SDK client and swaps to the legacy Azure route on a 404."""

    def __init__(self) -> None:
        self._client: OpenAI | AzureOpenAI | None = None
        self._legacy = _env_bool("AZURE_OPENAI_LEGACY_API", False)
        self._lock = threading.Lock()

    @property
    def route(self) -> str:
        if provider() != "azure":
            return provider()
        return "azure-legacy" if self._legacy else "azure-v1"

    def get(self) -> OpenAI | AzureOpenAI | None:
        with self._lock:
            if self._client is not None:
                return self._client
            p = provider()
            if p == "azure":
                self._client = _azure_legacy_client() if self._legacy else _azure_v1_client()
            elif p == "openai":
                self._client = OpenAI()  # reads OPENAI_API_KEY (and OPENAI_BASE_URL if set)
            return self._client

    def fall_back_to_legacy(self) -> bool:
        """Switch to the legacy route. Returns False if already on it (nothing to retry)."""
        with self._lock:
            if provider() != "azure" or self._legacy:
                return False
            log.warning("Foundry v1 route returned 404; switching to the legacy Azure OpenAI route")
            self._legacy = True
            self._client = _azure_legacy_client()
            return True


_holder = _ClientHolder()


def is_configured() -> bool:
    return provider() != "none"


def route() -> str:
    return _holder.route


def chat_model() -> str:
    if provider() == "azure":
        return os.getenv("AZURE_OPENAI_DEPLOYMENT") or os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT") or "gpt-4o"
    return os.getenv("OPENAI_CHAT_MODEL", "gpt-4o")


def embedding_model() -> str | None:
    """Deployment/model used for retrieval embeddings, or None for lexical retrieval only."""
    if provider() == "azure":
        return os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT") or None
    if provider() == "openai":
        return os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
    return None


def _with_fallback(call):
    """Run `call(client)`; on a 404 from the Foundry v1 route, retry once on the legacy route."""
    client = _holder.get()
    if client is None:
        raise RuntimeError("LLM is not configured")
    try:
        return call(client)
    except NotFoundError:
        if not _holder.fall_back_to_legacy():
            raise
        return call(_holder.get())


def embed(texts: list[str]) -> list[list[float]] | None:
    """Embed a batch of texts. Returns None when embeddings aren't configured."""
    model = embedding_model()
    if not is_configured() or not model or not texts:
        return None
    response = _with_fallback(lambda c: c.embeddings.create(model=model, input=texts))
    return [item.embedding for item in sorted(response.data, key=lambda d: d.index)]


def complete(messages: list[dict]) -> str:
    response = _with_fallback(
        lambda c: c.chat.completions.create(
            model=chat_model(), messages=messages, temperature=TEMPERATURE, max_tokens=MAX_TOKENS
        )
    )
    return (response.choices[0].message.content or "").strip()


def stream(messages: list[dict]) -> Iterator[str]:
    """Yield text deltas as they arrive."""
    response = _with_fallback(
        lambda c: c.chat.completions.create(
            model=chat_model(), messages=messages, temperature=TEMPERATURE, max_tokens=MAX_TOKENS, stream=True
        )
    )
    for chunk in response:
        if not chunk.choices:
            continue
        delta = chunk.choices[0].delta
        if delta and delta.content:
            yield delta.content
