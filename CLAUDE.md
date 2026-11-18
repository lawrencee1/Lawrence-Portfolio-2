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

## Brand rules (owner's decisions — follow strictly)

This repository is **public**. Keep private details out of it: no legal names, no other
businesses or websites of the owner, no client contact names, no internal file paths.
Those live with the owner, not here.

- Positioning: **animated map videos for travel, hospitality and property brands. Bali.**
  Also event content (trailers, motion posters, reels).
- Identity: the site shows **only "Lawrence Nathan"**. Never add another name, and never link
  to or mention any other business or website.
- Don't use content from the owner's old Instagram account.
- The Instagram handle isn't final: keep the Instagram link a placeholder until the owner
  gives the confirmed handle.
- Wowtravels: always **12.9K followers** (never 15K).
- Nuanu Snow Show (July 2025): show the trailer, one digital poster and one speaker reel.
  Wording: **"Designed and edited for Nuanu Snow Show"**. No result claims.
  Video previews are placeholders until the owner provides web-ready files.
- Domain: not purchased yet. Free option is lawrencenathan.vercel.app.
  Don't buy or change domains without asking.
- Copy: simple and short.

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
  - Opening curtain (`.kelir`): two cloths part, a gunungan draws itself. Skipped by any
    click/scroll/key and by reduced motion.
  - Hero: portrait in a pointed arch, rotating halo, flickering lamp glow, gold dust canvas
    with a wax-dot pointer trail, two gunungan that rise and sway.
  - Maps (paper): Bali drawn as batik; route draws on scroll, pins bloom, compass turns,
    vines grow in the corner (`[data-grow]`, `--g`).
  - Work (ink): four cloths hang from a rod and sway with scroll speed (`--sway`).
  - Services (paper): rows that fill with maroon on hover; icons draw in.
  - Process (maroon, pinned 340vh): a medallion is drawn, coloured, then "revealed"
    (`--draw`, `--fill`, `--rev`). Step copy is draft wording, not confirmed by the owner.
  - About (ink): waterfall photo in an arch.
  - Contact: closing diorama (sun, volcano, temple gate, palms, frangipani, birds) with the
    title in a cartouche, then the quote brief form on paper.
- Photos in `assets/` (portrait, waterfall, laugh) as .webp + .jpg fallback.
- Copy stays **simple and short**.
- Placeholders: `.ph` / `.soon` notes (Instagram link, email, video previews, Wowtravels).
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
