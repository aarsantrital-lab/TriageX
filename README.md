# TriageX

A personal AI chat workspace built as static files for GitHub Pages. It stores settings, credentials, chats and usage counters in local browser storage. Keys are excluded from backup exports.

## Start locally

Run `python3 -m http.server 8000` in this folder and visit `http://localhost:8000`. Remote use requires HTTPS (GitHub Pages provides it). Add your own API key in Settings → Connections.

## Publish with GitHub Pages

1. On GitHub create a new public repository called `TriageX` (or choose your own name).
2. Upload `index.html`, `styles.css` and `app.js` to the root of its default branch. Do not upload API keys.
3. Open the repository's Settings → Pages. Under Build and deployment choose **GitHub Actions**. The included workflow deploys on each push to `main`.
4. Wait for GitHub Pages to show the published URL. Open it in Safari on your iPhone; optionally use Share → Add to Home Screen.
5. Open Settings → Connections and enter your provider endpoint and API key on each device.

GitHub Actions can build and publish static files, but does not run a permanent backend. APIs that do not permit cross-origin browser requests need a separately hosted proxy. Do not put secret keys in a public repository or browser bundle. Browser local storage is accessible to JavaScript running on this origin, so use dedicated, limited keys and protect the device and GitHub account.

## What works and limitations

- OpenAI-compatible non-streaming chat completions using a custom base URL and key; providers must support browser CORS. Some models require provider-specific API formats or options and will not work through this adapter.
- Standard, Vercel Decisions API predicate/choice/score questions with shared context, and Hybrid routing, with optional Tavily or Exa search. In Hybrid, switch Web on to allow the decision model to search. Search results are untrusted data and providers' CORS policies may block direct use. Firecrawl key is stored for a future integration; Firecrawl scraping is not yet implemented.
- Optional comparison of up to 20 models, configured from the comparison bar. Choose two-column, three-column (two on phones), or list layouts and expand individual results. Each model is billed separately. Decision comparisons need decision-model IDs. Bundled model presets are a snapshot; use Refresh Vercel models for updates when browser access permits. The first successful response becomes the continuation context. No independent follow-up branches for each model yet.
- Flex requests send the gateway service-tier option on Vercel and `service_tier: flex` to other providers; provider support and actual serving tier vary. Ultrafast requests are restricted to Vercel's documented GPT 6 Astra and 6.1 Sol route. Batch is explicitly unavailable; it is asynchronous and must not silently be sent as an interactive request. Gemini 4 Carbon can be selected but actual model/tier availability depends on the provider; it is not a claim that Vercel supports Gemini Batch.
- Deepgram Voice Agent connects via a temporary token and streams microphone audio and audio responses, when token grant permits browser access and your account supports the selected agent configuration. This uses Deepgram's own hosted think provider, not the selected chat model. Its billing is separate. If a browser blocks the token request, a secure backend token broker is needed. Voice requires real-device testing.
- Text/code attachments and images are sent through OpenAI-compatible content blocks; model capabilities vary. PDFs and other binary files are not currently supported.
- Usage depends on the provider returning usage values. Cache hit rate is cached input divided by input where cache data was provided. Estimated spending uses manually supplied rates and excludes search, voice and calls outside this app. The same configured rates apply to all selected models and do not automatically account for tier-specific pricing; the number is a partial estimate when pricing is missing, not a bill.
- Markdown is displayed as plain text and safe clickable links. Responses are non-streaming. Saved prompt presets, chat folders, Firecrawl scraping, real batch jobs and per-model pricing are not yet implemented.

## Privacy

Backups contain conversations (including attached files) but never stored API keys. Anyone with access to your browser profile or a script running on this origin may be able to read stored keys and chats. Avoid using shared devices and avoid installing untrusted scripts.
