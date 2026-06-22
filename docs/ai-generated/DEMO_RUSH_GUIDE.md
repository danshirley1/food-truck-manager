# Demo rush guide — same day

**Created:** 2026-06-22  
**Goal:** Ship a working demo in ~1 hour. Skip everything that isn’t visible in the UI.

---

## Skip today (do after the demo)

| Item | Why skip |
|------|----------|
| Custom HF moderation model (`train.py`, Kaggle) | 2–4 hours; pre-trained model or rules-only is enough |
| Auth branch merge | Not in current game |
| Committing ML scaffolding docs | Nice-to-have, not demo-blocking |
| Interview talking points doc | Outdated (Redux/Postgres); pitch what’s actually built |

---

## Hour-by-hour checklist

### Step 1 — Local smoke test (~15 min)

```bash
cd food-truck-manager
nvm use                    # Node 22
cd web && rm -rf node_modules package-lock.json && npm install   # if build fails on native deps
cd .. && yarn dev
```

Open http://localhost:3000 and run through **one full day**:

1. Start game
2. Wait for scenario load (OpenAI)
3. Pick business choice + menu A/B/C (images should appear)
4. Submit → Chef’s Kudos verdict
5. Optional: Signature Dish with a safe description (see below)

**Pass criteria:** No console errors, scenario loads in &lt;10s, menu images show (or placeholder).

```bash
cd web && npm test   # 40 tests — quick sanity check
cd web && npm run build   # must pass before Heroku deploy
```

### Step 2 — Env vars (~5 min)

**Minimum (core game):**

```bash
OPENAI_API_KEY=sk-...
```

**Signature Dish + moderation (recommended for demo):**

```bash
HUGGINGFACE_API_KEY=hf_...                    # Inference Providers permission
HUGGINGFACE_MODERATION_MODEL=unitary/unbiased-toxic-roberta
TEXT_MODERATION_ENABLED=true
TEXT_MODERATION_PROVIDER=huggingface
TEXT_MODERATION_THRESHOLD=0.65                # slightly lenient for demo
SIGNATURE_DISH_IMAGES_ENABLED=true            # default; set false to skip image gen
```

**If HF blocks awkwardly during demo**, switch to rules-only (instant, predictable):

```bash
TEXT_MODERATION_PROVIDER=rules-only
```

Restart dev server after env changes.

### Step 3 — Deploy to Heroku (~20 min)

Heroku is **many commits behind** `main` (no Signature Dish, old image pipeline). Deploy current `main`.

`deploy:heroku` now pushes **`main`** (not the old `feature/heroku-deployment` branch).

```bash
cd food-truck-manager

# Set config on Heroku (once — adjust values)
heroku config:set OPENAI_API_KEY=sk-... --app food-truck-manager
heroku config:set HUGGINGFACE_API_KEY=hf_... --app food-truck-manager
heroku config:set HUGGINGFACE_MODERATION_MODEL=unitary/unbiased-toxic-roberta --app food-truck-manager
heroku config:set TEXT_MODERATION_ENABLED=true --app food-truck-manager
heroku config:set TEXT_MODERATION_PROVIDER=huggingface --app food-truck-manager
heroku config:set TEXT_MODERATION_THRESHOLD=0.65 --app food-truck-manager

# Deploy (you run this — requires your consent)
git push food-truck main:main

# Watch build
heroku logs --tail --app food-truck-manager
```

Live URL: https://food-truck-manager-8397e84e2f8b.herokuapp.com/

**If build fails on Heroku:** check `heroku logs`; build uses `next build` (webpack, not Turbopack).

### Step 4 — Rehearse demo script (~15 min)

**30-second pitch:**

> Turn-based food truck sim — 5 days, three resources (money, reputation, energy). Every day is **AI-generated**: location, crowd, business dilemmas, and three menu specials. Server validates scenarios with Zod. Menu photos come from **one batched web search** per day (fast). Optional **Signature Dish**: free-text → **Hugging Face moderation** → AI image.

**Live walkthrough (5–7 min):**

1. **Splash → Start** — explain win/lose (5 days, don’t go broke / burn out)
2. **Day context** — point out AI location + crowd vibe
3. **Step 1 Business** — trade-offs on badges (money / rep / energy)
4. **Step 2 Menu** — A/B/C, images from web search; effects hidden until submit
5. **Submit → Chef’s Kudos** — star rating, revealed effects, verdict copy
6. **Signature Dish** (sidebar) — type e.g. *“Crispy Korean fried chicken taco with gochujang mayo”* → moderation pass → image
7. **Skip to day 5** or mention you’d play through — show game over / victory card if time

**Safe Signature Dish examples (pass moderation):**

- Crispy Korean fried chicken taco with gochujang mayo
- Smoked brisket mac and cheese bowl
- Fresh mango habanero fish tacos

**Avoid during demo:** gross/edgy jokes (pre-trained toxicity model may block or show weird scores).

### Step 5 — Backup plan

| Problem | Fix |
|---------|-----|
| OpenAI slow / 429 | Refresh; mention “live API” — have screenshots ready |
| Menu images missing | Placeholder still works; explain web search fallback |
| Signature Dish blocked | Use rules-only provider or a tamer description |
| Heroku down | Demo **localhost** on your machine (most reliable) |
| Build fails locally | `cd web && rm -rf node_modules package-lock.json && npm install` |

---

## What to say about “remaining work”

Honest one-liner for interviewers:

> “Core loop and AI pipeline are done. Moderation uses a pre-trained HF model today; the next step is a fine-tuned allowed/blocked classifier on our Signature Dish dataset — training script and CSV are scaffolded in `ml/text-moderation/`.”

---

## Files touched for demo readiness (2026-06-22)

- `web/package.json` — production build without Turbopack (Heroku-stable)
- `package.json` — `deploy:heroku` pushes `main` not stale branch
- `SignatureDishPanel.tsx` — ESLint fix for production build
