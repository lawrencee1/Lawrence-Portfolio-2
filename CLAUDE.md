# Lawrence Portfolio — working rules for Claude

Static one-page portfolio (`index.html` + `styles.css` + `main.js`, no build step on Vercel).
`index.html` is **generated**: edit `scripts/build/template.html` (page structure and copy) or
`scripts/build/gen.py` (the drawn artwork: map, medallion, vines, closing scene), then run
`python3 scripts/build/gen.py index.html` from the repo root and commit the result. Also: `404.html`,
`robots.txt`, `sitemap.xml`, `site.webmanifest`, icons, `assets/og-image.jpg` (1200x630
sharing preview), and `vercel.json` (caching + security headers). The contact section has a
"quick brief" helper that builds a quote message to paste into a DM or email.
Deployed by Vercel (account: lawrenceenathan-1429s-projects, project: `lawrenceportfoliosmm`)
on every push to `main`.

- Public address: https://lawrencenathan.vercel.app (canonical, used in meta tags, sitemap)
- Original project address (still works): https://lawrenceportfoliosmm.vercel.app
- GitHub: https://github.com/lawrencee1/Lawrence-Portfolio-2

## Autonomy (the owner's standing instruction)

The owner asked Claude to **implement changes and fixes directly, without asking for their
opinion, until they say otherwise.** So:

1. Make the change, commit, and **push straight to `main`** (no branches or pull requests needed).
2. **Verify it yourself** with `scripts/check-deploy.sh` (see below). Do not ask the owner to check.
3. If the deploy fails or the page looks broken, **fix it and push again** until it's working.
4. When content is missing, use clearly marked `[Placeholder]` text instead of stopping to ask.
5. At the end, report briefly: what changed, the live link, and screenshots.

Still ask first before anything that's hard to undo or outside this site: deleting the
repository or Vercel project, changing domains, adding paid services, or publishing
personal details (email, phone, address) that the owner hasn't provided for the site.

## Verifying a deploy

```bash
scripts/check-deploy.sh
```

It waits for Vercel's GitHub status on the latest commit (success / failure), confirms the
live site responds, and saves desktop + phone screenshots to `/tmp/deploy-check/`.
Look at the screenshots before reporting done.

If Vercel reports a failure, read the build logs through the Vercel API
(`api.vercel.com`; a token for the Lawrence account is injected by the session's network
proxy when configured): list deployments with
`GET /v6/deployments?projectId=lawrenceportfoliosmm&limit=5`, then
`GET /v3/deployments/<id>/events`.

## The pages of the site

All pages live in this repository and on the same Vercel project.

- **`/` (version 1)**: video-first. "I make videos for brands with no footage of their own",
  fixed prices per video. Files: `index.html` (generated from `scripts/build/template.html`),
  `styles.css`, `main.js`.
- **`/studio` (version 2)**: the whole-presence package: ideas, content, posting and a website
  the client can edit themselves, sold as monthly plans. Lighter, paper-first look.
- **`/clinics`**: version 2 written for dental and health clinics. Headline "More booked
  consults, without filming", the editor demo in the hero, a "Safe to post" section about
  Meta's health ad rules, and explainer samples. **This is the page to link in any message
  to a clinic.**
- `/studio` and `/clinics` share `studio.css` (loaded after `styles.css`) and `studio.js`.
  Build them with `python3 scripts/build/gen.py studio.html studio.html` and
  `python3 scripts/build/gen.py clinics.html clinics.html` (output file, then template name in
  `scripts/build/`). They share the plans, steps, questions and contact sections, so keep
  the two templates in step when one changes.
- Neither page is linked from the homepage; the owner sends each link to different prospects.
- Version 2 sells posting and websites as well as video. That is the owner's choice for these
  pages; version 1 keeps "sell video, not social media management".

### Version 2 rules (owner's copy, 25 Nov 2026)

- Plans, exactly as the owner wrote them: Content $650/month (8 pieces: 4 videos and 4
  designs), Content and Posting $1,150/month (12 pieces, posted on Instagram, TikTok and
  Facebook, a short report every month; "Recommended", shown first on phones), Whole Presence
  $1,850/month (plus a new website built in month one, the editor, updates on request).
  Website alone: one-time $1,400.
- Founding banner: "Founding clients: 20% off your first 3 months. Only 5 spots." Remove it
  when the owner says the spots are gone.
- Terms: USD, 3-month minimum then month to month, "Approve your first content plan or pay
  nothing", paid monthly in advance by card or Wise, 2 rounds of changes per batch, not
  included: replying to DMs and comments, ad spend, filming. Whole Presence: the website is
  the client's after 6 months; cancelling earlier means paying the rest of $1,400 minus $233
  per month already paid.
- **The website and its editor are a one-time price with no monthly maintenance fee.** Say so
  wherever the website is sold.
- The click-to-edit editor (`#ed`) is a front-end demo only and must keep its "This is a
  demo" note. The real editor is the owner's to build.
- Clinics page: no promised patient numbers, no before-and-after claims, no invented results.
  The "Safe to post" points must stay accurate to Meta's published Health and Wellness ad
  rules and keep the note that it is not legal or medical advice.
- The owner asked for a timeframe on the Wowtravels stat ("in 1 video"). Not added, because
  the before/after screenshots on the homepage show 417 and 591 posts. Add a timeframe only
  when the owner gives one that matches the evidence (months, or the one video with its view
  count).

## Brand rules (owner's decisions, follow strictly)

This repository is **public**. Keep private details out of it: no legal names, no other
businesses or websites of the owner, no client contact names, no internal file paths.
Those live with the owner, not here.

- Positioning: **"I make videos for brands with no footage of their own."** Support line:
  "Animated maps, motion graphics and licensed footage, so you don't need to film anything."
  Animated maps are the signature method. Sell video, not social media management.
- Audience: travel, hospitality and property brands, plus **health and wellness** (clinics,
  dental practices, gyms, wellness studios), which the owner is now targeting. The Work
  section opens on the "Health and wellness" tab for that reason.
- Identity: the site shows **only "Lawrence Nathan"**. Never add another name, and never link
  to or mention any other business or website.
- Claims: never invent metrics, results, testimonials or quotes. The only result that may be
  claimed is Wowtravels growing from **2.1K to 12.9K followers** (never 15K, never the word
  "organic"). Wording: "I made the map videos for a travel account that grew from 2.1K to 12.9K."
  For every other client use **"Designed and edited for"** with no result claims.
- Offers and prices (USD, fixed, shown on the site): Map Reel $150 (3 for $400), 15 to 30 s,
  48 hour delivery. Also: Property Launch Reel $300 to $600, Ad Variant Pack $200 to $350,
  Venue Loop $100 to $200. The Map Reel leads; the others are "also available". Never show an
  hourly rate.
- Contact shown on the site: WhatsApp +62 896-0619-7040, lawrencee.nathan@gmail.com and
  Instagram **@rawwaesthetic** (confirmed by the owner).
- Copy: English, short and clear, **no em-dashes**, no hype.
- Clients on the site: logo strip (Wowtravels as text, logos for Kilo Pererenan, Bella, Lava
  Lounge, Health Hub Bali, Biohacking Bali, nuHuman RAW, Luxe Concierge, Poppy Advertising and
  the Snow Show). Work tabs:
  - Health and wellness: nuHuman RAW body-data overlays, Biohacking Bali conference explainer,
    and the "One Plate, One Family" nutrition explainer. That last one is a **concept piece**:
    always label it as a sample, never as client work, and never claim nutrition-campaign
    experience or name any organisation with it.
  - Events: Nuanu Snow Show trailer, digital poster, speaker reel.
  - Venues: three Lava Lounge animated flyers.
  - 3D and design: the 3D mascot and 3D promo (the owner's own studio pieces) and the Luxe
    Concierge social designs.
  - Films and reels: two pieces for private clients shown **without names or logos** (a villa
    party film cut to venue and performance shots only, and a barbershop reel).
- Prices on the site are the owner's. Do not add or change a price without the owner saying so.
  Anything outside the four offers is "send a brief, fixed quote before I start".
- Domain: not purchased yet. Free option is lawrencenathan.vercel.app.
  Don't buy or change domains without asking.

## Style notes — current design: "Wastra" (batik)

- Concept: the site is made of **layered batik cloth and cut paper**, inspired by Javanese
  batik and shadow-puppet (wayang) staging. All artwork is original SVG drawn for this site;
  never copy reference images the owner shares.
- Motifs (shared SVG patterns/symbols at the top of the page): kawung, truntum, parang,
  mega mendung clouds, cecek dots, tumpal triangle borders, and the gunungan figure.
- Palette: sogan black `--ink`, `--maroon`, `--gold` / `--gold-lt`, `--paper`, `--indigo`,
  `--sage`, `--brown`. Dark and paper sections alternate, joined by scalloped `.edge` borders.
- Fonts: Cormorant Garamond (display, italic for accents), Jost (body and labels).
- Sections and their signature animation:
  - Opening curtain (`.kelir`): two cloths part, a gunungan draws itself. Kept short
    (opens after about 1 second), plays once per browser tab (`sessionStorage`), and is
    skipped by any click/scroll/key and by reduced motion.
  - Hero: headline (words rise in), portrait in a pointed arch, rotating halo, flickering
    lamp glow, gold dust canvas with a wax-dot pointer trail, two gunungan that rise and sway.
    The headline, pitch and buttons must show at once on every page: never hide them behind
    an animation. Phones (760px and under) get no opening curtain.
  - Clients (maroon band): slow logo ribbon under the label "Designed and edited for".
  - Maps (paper): Bali drawn as batik; route draws on scroll, pins bloom, compass turns,
    vines grow in the corner (`[data-grow]`, `--g`).
  - Proof (ink): Wowtravels before/after screenshots and two map videos.
  - Work (ink): tabs (`.tab[data-tab]`) switch between rods (`.rod-wrap[data-rod]`), one rod
    of cloths visible at a time; cloths sway with scroll speed (`--sway`) and each carries a
    real video or image tile. Without JavaScript every rod shows with its title.
  - Phones get a floating WhatsApp button (`.fab`) between the hero and the contact form.
  - Prices (paper): Map Reel card, then "also available" rows that fill with maroon on hover.
  - Process (maroon, pinned 250vh): a medallion is drawn, coloured, then "revealed"
    (`--draw`, `--fill`, `--rev`).
  - About (ink): waterfall photo in an arch.
  - Contact: closing diorama (sun, volcano, temple gate, palms, frangipani, birds) with the
    title in a cartouche, then the quote brief form on paper.
- Photos in `assets/` (portrait, waterfall, laugh) as .webp + .jpg fallback.
- Work media in `assets/work/`: for each video `name.jpg` (poster), `name-loop.mp4` (silent
  8 s preview, 360 px wide, loaded and played only while on screen) and `name.mp4` (full cut
  with sound, 480 px wide, opened in the `<dialog id="viewer">`). Every tile image needs alt
  text and every `<video>` a `poster`. Keep new videos this small:
  the whole folder is about 27 MB. Logos in `assets/logos/` are tinted cream on transparent.
- Copy stays **simple and short**.
- Selling comes first: every section must help a visitor understand the offer, see proof,
  or get in touch. Don't add decoration that slows that down (no custom cursor, no long
  intro, no extra pinned sections).
- The public page shows no "[placeholder]" text.
  Still missing from the owner: a property launch example, a real map reel made for a
  hotel, villa or clinic, client testimonials, and a decision on health-specific pricing.
- Every animation must respect `prefers-reduced-motion` (see the block at the end of
  `styles.css`) and the page must work at phone width (390px) with no sideways scrolling.
- Never commit secrets or tokens. The repository is public.

## Earlier designs (restore points)

The owner may ask to go back. Restore a design with
`git checkout <commit> -- index.html styles.css`, then commit and push. Designs 1 to 3 keep
their script inside `index.html` and don't use `main.js`, so it can stay in place.
The batik design itself is commit `f6f3725` (restore `index.html`, `styles.css`, `main.js`).
- Design 1 "simple portfolio": commit `ff50591`
- Design 2 "notebook letter": commit `4bfa360`
- Design 3 "The Edit" (dark video-editor look): commit `fad1422`
- Batik design before real clients, prices and contact were added: commit `f60a3f1`
