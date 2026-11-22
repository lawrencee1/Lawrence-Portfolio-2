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

## Brand rules (owner's decisions, follow strictly)

This repository is **public**. Keep private details out of it: no legal names, no other
businesses or websites of the owner, no client contact names, no internal file paths.
Those live with the owner, not here.

- Positioning: **"I make videos for brands with no footage of their own."** Support line:
  "Animated maps, motion graphics and licensed footage, so you don't need to film anything."
  Animated maps are the signature method. Sell video, not social media management.
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
- Contact shown on the site: WhatsApp +62 896-0619-7040 and lawrencee.nathan@gmail.com.
  The Instagram handle is **not confirmed**, so the site has no Instagram link. Add one only
  when the owner gives the final handle.
- Copy: English, short and clear, **no em-dashes**, no hype.
- Clients on the site: logo strip (Wowtravels and Nuanu Snow Show as text, logos for Kilo
  Pererenan, Bella, Lava Lounge, Health Hub Bali, Biohacking Bali, nuHuman RAW, Luxe Concierge,
  Poppy Advertising). Work shown: Wowtravels map videos, three Lava Lounge animated flyers,
  Luxe Concierge social designs, and two pieces for private clients shown **without names or
  logos** (a villa party film cut to venue and performance shots only, and a barbershop reel).
- Nuanu Snow Show (July 2025): may be shown as trailer, one digital poster, one speaker reel
  once the owner supplies the files.
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
  - Clients (maroon band): slow logo ribbon under the label "Designed and edited for".
  - Maps (paper): Bali drawn as batik; route draws on scroll, pins bloom, compass turns,
    vines grow in the corner (`[data-grow]`, `--g`).
  - Proof (ink): Wowtravels before/after screenshots and two map videos.
  - Work (ink): two rods of three cloths that sway with scroll speed (`--sway`); each cloth
    carries a real video or image tile.
  - Prices (paper): Map Reel card, then "also available" rows that fill with maroon on hover.
  - Process (maroon, pinned 250vh): a medallion is drawn, coloured, then "revealed"
    (`--draw`, `--fill`, `--rev`).
  - About (ink): waterfall photo in an arch.
  - Contact: closing diorama (sun, volcano, temple gate, palms, frangipani, birds) with the
    title in a cartouche, then the quote brief form on paper.
- Photos in `assets/` (portrait, waterfall, laugh) as .webp + .jpg fallback.
- Work media in `assets/work/`: for each video `name.jpg` (poster), `name-loop.mp4` (silent
  8 s preview, 360 px wide, loaded and played only while on screen) and `name.mp4` (full cut
  with sound, 480 px wide, opened in the `<dialog id="viewer">`). Keep new videos this small:
  the whole folder is about 15 MB. Logos in `assets/logos/` are tinted cream on transparent.
- Copy stays **simple and short**.
- Selling comes first: every section must help a visitor understand the offer, see proof,
  or get in touch. Don't add decoration that slows that down (no custom cursor, no long
  intro, no extra pinned sections).
- The public page shows no "[placeholder]" text.
  Still missing from the owner: the confirmed Instagram handle, the Nuanu Snow Show videos,
  a property launch example, and a real map reel made for a hotel, villa or restaurant.
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
