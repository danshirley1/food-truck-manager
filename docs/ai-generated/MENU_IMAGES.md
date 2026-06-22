# Menu special images

**Last updated:** 2026-06-22

After scenario text is generated, **one OpenAI Responses API call** with the `web_search` tool finds an HTTPS image URL for each of the three menu specials. No DALL·E, TheMealDB, or Wikimedia.

## Flow

```
POST /api/scenarios/generate
  → LLM scenario JSON
  → attachMenuImageUrls() — batched web search
  → response with menuOptions[].imageUrl
```

Placeholder (`MenuSpecialImage`) if URL missing or load fails.

## Config

```bash
OPENAI_API_KEY=           # required
OPENAI_SEARCH_MODEL=      # optional, default gpt-4o-mini
```

## Files

- `web/src/lib/ai/resolve-menu-image-url.ts`
- `web/src/lib/ai/generate-scenario.ts`
- `web/src/components/MenuSpecialImage.tsx`
