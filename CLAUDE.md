# Lawrence Portfolio — working rules for Claude

Static one-page portfolio (`index.html` + `styles.css`, no build step).
Deployed by Vercel (account: lawrenceenathan-1429s-projects, project: `lawrenceportfoliosmm`)
on every push to `main`.

- Live site: https://lawrenceportfoliosmm.vercel.app
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

## Style notes — current design: "The Edit"

- Concept: the site behaves like a **video editor** (Lawrence is a short-form video editor /
  clipper, Instagram @twentyoneprojectss). Viewfinder frame, blinking REC light, running
  timecode, editing timeline with clip blocks and a scroll-driven playhead, waveform, ticker.
- Bold and creative, not templated. Copy is **simple and short**, not personal/confessional.
- Dark only. Colors: `--bg` near-black, `--acid` #c6ff3d (main accent), `--rec` red,
  `--blue`, `--pink` for clips.
- Fonts: Anton (display), Space Grotesk (body), JetBrains Mono (HUD/labels).
- Photos in `assets/` (portrait, waterfall, laugh) as .webp + .jpg fallback.
- Hero name: solid copy behind the photo + outline copy (`.name-ghost`) over it.
  On phones, LAWRENCE sits above the photo and NATHAN below.
- Reveal animations add `.in` via IntersectionObserver; respect reduced motion.
- Placeholders: `.ph` mono notes (tools list, email).
- Must look right at phone width (390px) with no sideways scrolling.
- Never commit secrets or tokens. The repository is public.

## Earlier designs (restore points)

The owner may ask to go back. Restore a design with
`git checkout <commit> -- index.html styles.css` then commit and push.
- Design 1 "simple portfolio": commit `ff50591`
- Design 2 "notebook letter": commit `4bfa360`
