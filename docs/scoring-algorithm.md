# TipCheck Scoring Algorithm

This document is the source of truth for how TipCheck calculates the numbers it displays. Hand it to anyone (mobile, web, future contributors) who needs to compute or display the same scores.

## TL;DR — there are two independent scores

TipCheck has **two completely separate numbers**. They are never blended. They are computed from different data sources and always shown side by side, never combined.

| Number | Range | Source | Where it appears in the API |
| --- | --- | --- | --- |
| **`rating`** (Google star rating) | 1.0–5.0 (decimal) | 100% Google Places `rating` field | All endpoints |
| **`tipScore`** (TipCheck tipping-culture score) | 1–5 (integer) | 100% Google Place Details review text — keyword sentiment | `/api/places`, `/api/nearby-places` |
| **`communityScore`** (TipCheck user submissions) | 1.0–5.0 (decimal, 1 dp) | 100% Supabase `tip_reports` table — average of user scores | `/api/discover`, `/api/nearby` (NOT in `/api/places` or `/api/nearby-places`) |

**Important for Felipe:** the endpoint you're using (`/api/places` and `/api/nearby-places`) returns `rating` and `tipScore` only. It does NOT return `communityScore`. If you want community data on the app, ask Pablo to add it (see "How to get community on app" at the bottom).

---

## 1. Google Rating (`rating`)

This is the unmodified Google Places star rating. We pass it through verbatim.

```
rating = place.rating  (or 0 if Google has no rating)
```

No math. Same value Google shows on Maps. Decimal, 1.0–5.0.

---

## 2. TipScore (`tipScore`)

This is TipCheck's own opinion on tipping culture at a venue, derived **purely** from the text of Google reviews. **Google's star rating does NOT feed into this number.** The two are independent.

### Inputs

- Up to 5 most recent Google reviews fetched from Google Place Details API (`fields=reviews`)

### Procedure

1. Fetch up to 5 reviews via Google Place Details API
2. Concatenate all review text into one lowercase string
3. Count occurrences of each "bad" keyword and each "good" keyword (each keyword counted globally, with regex `g` flag — multiple hits in one review all count)
4. Apply the rules below

### Keyword lists (exact)

**Bad keywords** (each match subtracts 1 from base):

```
pressure, forced, mandatory, guilt, awkward, aggressive, required,
tip screen, flipped, expected to tip, made to tip, tip jar shoved
```

**Good keywords** (each match adds 1 to base):

```
no pressure, optional, fair tip, no tip, relaxed, no obligation,
tip was optional, not pressured, tipping optional
```

Both lists are matched case-insensitively as substrings (regex `g` flag).

### Score formula

Let `badCount` = total bad keyword matches across all reviews. Let `goodCount` = total good keyword matches.

```
base = 3

if badCount === 0 AND goodCount === 0:
    tipScore = 3
    summary = "No specific tipping mentions found in reviews."

else if badCount > goodCount:
    tipScore = max(1, 3 - badCount)
    summary = "{badCount} review(s) mention tipping pressure or discomfort."

else if goodCount > badCount:
    tipScore = min(5, 3 + goodCount)
    summary = "{goodCount} review(s) praise the relaxed tipping experience."

else (badCount === goodCount AND > 0):
    tipScore = 3
    summary = "Mixed tipping experiences reported."
```

If the Google Place Details call fails for any reason, `tipScore` falls back to 3 and the summary defaults to "No tipping data available yet."

### Worked examples

- Reviews mention "no pressure" once → goodCount=1, badCount=0 → `tipScore = min(5, 3+1) = 4`
- Reviews mention "mandatory" twice and "guilt" once → badCount=3, goodCount=0 → `tipScore = max(1, 3-3) = 1` (clamped to 1)
- Reviews mention "optional" once and "pressure" once → goodCount=1, badCount=1 → `tipScore = 3` ("Mixed")
- No reviews returned by Google → `tipScore = 3` ("No specific tipping mentions...")

### Why it's integer 1–5

Because the bumps are always whole numbers and the base is 3. This is a deliberate choice — the score is meant to be displayed as a 5-star/5-pip indicator, not a decimal.

---

## 3. Community Score (`communityScore`)

User-submitted scores from inside the TipCheck web app, stored in Supabase table `tip_reports` (columns: `place_id`, `place_name`, `score`, `pressured`, `comment`, `tip_added`, `created_at`).

### Procedure

1. Pull all rows from `tip_reports` where `place_id` matches the venue
2. Average the `score` column
3. Round to 1 decimal place

```
communityScore = round( sum(scores) / count(scores) * 10 ) / 10
```

If no community reports exist for a place, `communityScore = null` and `communityReports = 0`. **Don't fall back to TipScore or Google rating** — leave it null and either hide the Community badge or show "No community reports yet."

This score is decimal, 1.0–5.0.

### Where it's exposed in the API today

- `/api/discover?zip=...` — returns `communityScore` + `communityReports` per place inside each category
- `/api/nearby?lat=...&lng=...` — same

It is NOT currently in `/api/places` or `/api/nearby-places` (the two endpoints the FlutterFlow app uses). See next section.

---

## How to display the same numbers Felipe's web app shows

For each restaurant card on the mobile app:

1. **Star rating** — display `rating` from `/api/places` directly. This matches Google.
2. **TipMeter / "Tipping culture"** — display `tipScore` from `/api/places` as 1–5 pips. The `tip` field is the human-readable summary string Pablo's web app shows under the meter.
3. **Community Score** — currently **not available** in `/api/places`. See below.

## How to get Community Score on the app

The web app's Discover page mixes community data into Google results. The mobile-friendly `/api/places` endpoint does not. Two options:

**Option A (recommended) — add `communityScore` to `/api/places`**

Pablo can extend `/api/places` to also pull the relevant rows from Supabase and attach `communityScore` and `communityReports` to each item. Single endpoint, mobile gets everything in one call. Roughly 10 minutes of work.

**Option B — separate `/api/community-score?placeIds=...`**

A dedicated endpoint that takes a comma-separated list of `place_id`s and returns `{ place_id: { communityScore, communityReports } }` so the app can fetch community in a second call after rendering Google results. More flexible if Felipe ever wants to refresh community data without re-fetching Google.

Tell Pablo which approach you want and he'll ship it.

---

## What's NOT in the algorithm (yet)

These are sometimes asked about. They currently have **zero weight** in any TipCheck score:

- Google's `user_ratings_total` (number of Google reviewers) — used only for Hidden Gems filter on Discover, not for scoring
- Price level
- Cuisine / category
- Distance from user
- Time of day, day of week
- The `pressured` boolean in `tip_reports` — collected from users but not currently used in any score (only counted in Discover's "noPressure" tally for future logic)

If TipCheck adds any of these to scoring later, this doc gets updated and both apps need to update together.

---

## Last verified

- Date: 2026-05-04
- Live endpoint: `https://tipcheckapp.vercel.app/api/places?query=...`
- Source: `app/api/places/route.js`, `app/api/discover/route.js` on `main` branch of `pabloduquepd-cell/Tipcheck`
