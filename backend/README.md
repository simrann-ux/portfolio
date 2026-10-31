# Portfolio assistant backend

A small RAG service behind the "Ask AI" box on `about.html`. FastAPI retrieves the most relevant sections of `knowledge/profile.md` and asks GPT-4o to answer strictly from them. The frontend (`../chat.js`) streams the answer and falls back to browser-side keyword answers whenever this API is unreachable.

```
Browser (about.html + chat.js)
   │  POST /api/chat/stream        (SSE)
   ▼
FastAPI (main.py)
   ├── rag.py   : chunk profile.md by heading, hybrid lexical + embedding retrieval
   └── llm.py   : GPT-4o via Azure OpenAI (default) or OpenAI
```

## 1. Run locally

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env        # then fill in your Azure OpenAI values
.venv/bin/uvicorn main:app --reload --port 8000
```

Open <http://localhost:8000/about.html>. With `SERVE_FRONTEND=true` (the default in `.env.example`) the static site is served by the same process, so the chat talks to the API on the same origin. Check <http://localhost:8000/api/health>; `llm_configured` must be `true` for real answers. Without a key the server still runs and the chat uses its browser fallback.

## 2. Azure OpenAI setup

1. In Microsoft Foundry, create (or reuse) an Azure OpenAI resource and a project.
2. Deploy `gpt-4o`. Note the **deployment name** (not the model id) and put it in `AZURE_OPENAI_DEPLOYMENT`.
3. Under "Models + endpoints", copy the Target URI host (just the origin, e.g. `https://my-resource.openai.azure.com`) into `AZURE_OPENAI_ENDPOINT`, and a key into `AZURE_OPENAI_API_KEY`.
4. Optional but recommended: deploy `text-embedding-3-small` and put its deployment name in `AZURE_OPENAI_EMBEDDING_DEPLOYMENT`. This turns on hybrid lexical + semantic retrieval. Leave it blank for lexical retrieval only, which works well for a profile this small.

The client first calls the Foundry v1 route (`<endpoint>/openai/v1/`, no api-version). If that returns 404 it automatically switches to the legacy Azure OpenAI route using `AZURE_OPENAI_API_VERSION`; set `AZURE_OPENAI_LEGACY_API=true` to start on the legacy route. `/api/health` reports which route is active.

To use the OpenAI platform instead, set `LLM_PROVIDER=openai` and `OPENAI_API_KEY`.

## 3. Edit what the assistant knows

Everything it can say lives in `knowledge/profile.md`. Each `##` heading is one retrieval chunk. Keep facts under descriptive headings, keep it in sync with `resume.pdf`, and don't add anything you wouldn't want quoted to a recruiter. Embeddings are cached in `knowledge/.embeddings_cache.json` and refresh automatically when a chunk changes.

## 4. Deploy

The static site and the API deploy separately.

**Render (free tier, easiest).** The repo root has a `render.yaml`. In Render, "New +" → "Blueprint", point it at the repo, then add the env vars from `.env.example` in the dashboard (never commit `.env`). Free instances sleep after idle and take up to a minute to wake; `chat.js` shows "Waking up the assistant…" and retries while that happens.

**Azure Container Apps / App Service.** Build with the `Dockerfile` in this folder and set the same env vars as app settings. Set `SERVE_FRONTEND=false` when the site is hosted elsewhere (GitHub Pages, Netlify).

**After deploying:** put the API's public URL (no trailing slash) in `API_BASE_PROD` at the top of `../chat.js`, and set `ALLOWED_ORIGINS` on the server to your site's origin.

## 5. API

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/health` | – | `{status, llm_configured, provider, model, chunks, semantic}` |
| POST | `/api/chat` | `{message, history?}` | `{reply, sources}` |
| POST | `/api/chat/stream` | `{message, history?}` | SSE frames: `sources`, `delta`…, `done` or `error` |

`history` is a list of up to 8 `{role: "user" | "assistant", content}` turns. Requests are rate-limited per IP (`RATE_LIMIT_PER_MINUTE`, default 20). `RAG_TOP_K`, `LLM_TEMPERATURE` and `LLM_MAX_TOKENS` tune retrieval depth and generation. `ALLOWED_ORIGINS` is a comma-separated list; localhost and 127.0.0.1 are always allowed. Set `LOG_QUESTIONS=true` to append every exchange to `logs/questions.jsonl`.
