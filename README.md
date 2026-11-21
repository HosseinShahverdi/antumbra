# ANTUMBRA — Eclipse Atelier

**A brand and web concept for a fictional Lisbon atelier that makes couture headwear by hand, in editions of nine.**
_Crowns for the hour the light goes out._

Self-initiated portfolio project (Behance / LinkedIn / Instagram). Antumbra is not a real company; every product, price and line of copy is invented, and the campaign stills are original AI-generated images made for this project (see [`CREDITS.md`](./CREDITS.md)).

---

## 1. Creative concept

### From the moodboard
The reference (a gothic avant-garde mask e-commerce concept on Behance) contributed only high-level traits:

| Trait in the reference | How Antumbra uses it |
| --- | --- |
| Strict monochrome — ink, ash grey, bone white, film grain | Kept, as a 9-step neutral scale with a warm bone instead of pure white, and a live grain layer |
| Huge, light, extended display caps bleeding off the canvas | Kept as an idea, rebuilt with the variable **Anybody** font whose width axis is animated (letters expand from condensed to extended) |
| Sculptural black headpieces, studio portraits | Re-thought around one new idea — the **eclipse** — instead of masks |
| Dark editorial layouts alternating with light grey panels | Kept: ink sections alternate with a warm paper `#E3DFD7` |

Nothing was traced or reused: new name, identity, copy, imagery, layouts and interactions.

### The idea
The **antumbra** is the shadow you stand in to see a ring of light around the moon — the eclipse where darkness never quite wins. The atelier names every piece after an eclipse phenomenon (Annulus, Corona, Baily’s Beads, Diamond Ring, Penumbra, Umbra, Second Contact, Chromosphere) and the whole site behaves like one:

- the **preloader** is an eclipse that opens into the site;
- in the **hero** the portrait sits inside a sun-shaped aperture, **your cursor is the light** that reveals it, and **scrolling eclipses it**;
- the **instrument** lets you drag the moon across a real-time shader sun until totality — which is where the fitting CTA appears;
- the **campaign** is a film in four contacts, each frame opening through a circular aperture.

### System
- **Type** — Anybody (variable `wdth` 50–150) for display caps, Instrument Serif italic for couture voice, Geist for reading, Geist Mono for labels and data.
- **Colour** — `ink #09090A`, `night #0F0F10`, `coal #18181A`, `ash #2A2A2C`, `iron #46464A`, `smoke #8D8B86`, `mist #BDBAB3`, `paper #E3DFD7`, `bone #EFECE5`. No accent hue: light itself is the accent.
- **Mark** — a ring with an offset disc (an eclipse at second contact) that slides to centre on hover.
- **Motion** — slow, eased “eclipse” curves (`cubic-bezier(.72,0,.18,1)`), masked word reveals, clip-path apertures, and variable-font width changes.

### Page narrative
| § | Section | Role | Signature moment |
| --- | --- | --- | --- |
| — | Preloader | Opening | Moon crosses sun while assets load, screen opens through the eclipse |
| 00 | Hero | First impression | Cursor-as-light portrait reveal, dial ring, difference-blend wordmark, scroll-driven eclipse |
| 01 | Manifesto | Philosophy | Words light up as you read, with inline image pills |
| 02 | Collection — Totality | Products | Pinned horizontal gallery with parallax, working filters, product panels |
| 03 | Anatomy of a Corona | Signature showcase | Pinned, snapping annotation of the hero piece |
| 04 | The ledger | Differentiation | Four counting numerals (9 / 146 / 0 / 1) with atelier stills |
| 05 | The instrument | Interactive experience | Three.js eclipse you drive by drag, slider or keyboard |
| 06 | Night Nº 07 | Campaign story | Film in four contacts, aperture transitions, live timecode |
| 07 | Fittings | Closing statement + conversion | “The light returns” image, full appointment form with validation |
| — | Footer | Conclusion | Night Letter sign-up, live Lisbon clock, countdown to the 2 Aug 2027 total eclipse, rising wordmark |

Everything that looks interactive works: menu, filters, product panel (size / finish / add to bag), bag (quantities, remove, persisted in `localStorage`), fitting form (validation, loading, success), newsletter, slider, drag, keyboard.

---

## 2. Stack and decisions

| Tool | Why |
| --- | --- |
| **Next.js 16** (App Router, TypeScript), `output: "export"` | One static route; deploys anywhere as plain files |
| **Tailwind CSS v4** | Tokens in `@theme`, utilities for responsive art direction |
| **GSAP 3 + ScrollTrigger** (`@gsap/react`) | All choreography: intro, scrubbed timelines, pins, containerAnimation |
| **Lenis** | The *only* smooth-scroll engine (Locomotive Scroll is not installed). Driven by the GSAP ticker, feeds `ScrollTrigger.update`, skipped under reduced motion |
| **Three.js** | Only for the eclipse instrument — one full-screen shader quad. Lazy-loaded (`import("three")`) when the section mounts |
| **sharp** | `scripts/process-images.mjs` turns the raw stills into responsive WebP + blurred placeholders + a typed manifest |
| **Solar icons via Iconify** | `scripts/extract-icons.mjs` copies just the 19 icons used into a local module — no runtime API |

Framer Motion was deliberately left out: GSAP already owns every animated property, and two systems on the same element fight.

### Structure
```
antumbra/
├─ assets-src/                 raw campaign stills (PNG, not shipped)
├─ public/
│  ├─ images/                  responsive WebP (generated)
│  └─ og.jpg                   social card (generated)
├─ scripts/
│  ├─ process-images.mjs       sharp pipeline → public/images + manifest
│  └─ extract-icons.mjs        Solar icons → src/lib/icons.generated.ts
└─ src/
   ├─ app/                     layout (fonts, metadata), page, globals.css, icon.svg
   ├─ lib/                     data.ts (brand content), gsap.ts, generated manifests
   └─ components/
      ├─ providers/            SmoothScroll (Lenis), ShopProvider (bag + panels)
      ├─ layout/               Nav, MenuOverlay, BagDrawer, ProductDrawer, Footer
      ├─ sections/             Preloader, Hero, Manifesto, Collection, Anatomy,
      │                        Ledger, Instrument (+ eclipse/shader.ts), Night, Fittings
      └─ ui/                   Picture, SplitWords, Button, Magnetic, Cursor, Icon,
                               Clock, Countdown, useDialog
```

---

## 3. Run, build, deploy

Requires Node 20+ (built with Node 26 / npm 11).

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build        # static export → ./out
npm start            # serves ./out on http://localhost:3000
```

Optional, only when you change source images or icons:

```bash
npm run images       # needs ./assets-src (raw PNGs)
npm run icons
```

**Deploy** — the `out/` folder is the whole site.
- **Vercel**: import the repo, framework “Next.js”, no settings needed.
- **Netlify / Cloudflare Pages**: build `npm run build`, publish directory `out`.
- **Any static host / S3**: upload the contents of `out/`.
- Set `NEXT_PUBLIC_SITE_URL=https://your-domain` at build time so the Open Graph image URL is absolute.

---

## 4. Accessibility, resilience, performance

- **No JavaScript** → the preloader is hidden by a `<noscript>` rule; every heading, image, product and caption is server-rendered and readable; the first campaign frame shows.
- **`prefers-reduced-motion: reduce`** → no Lenis, no pins or scrubs (collection becomes a native swipe row, campaign frames stack), the hero light is fixed, the instrument becomes a static CSS eclipse still driven by the slider, grain stops.
- **Keyboard** → skip link, visible focus everywhere, focus-trapped dialogs (menu, bag, product) that close on <kbd>Esc</kbd> and restore focus, the instrument is fully operable with the range input.
- **Screen readers** → split headings keep an unsplit `sr-only` twin; decorative layers are `aria-hidden`; live regions for bag count, instrument phase and form status.
- **Pointer** → custom cursor and magnetic buttons only on fine pointers; touch gets drag-to-light and native swipe.
- **WebGL** → DPR capped at 1.5, renders only while on screen and the tab is visible, disposes geometry / material / renderer, falls back to CSS on context loss or missing WebGL.
- **Media** → 40 WebP files (2.8 MB total for every size), `srcset`/`sizes`, intrinsic dimensions, blurred inline placeholders, lazy below the fold, hero eagerly loaded with high fetch priority.

---

## 5. Capturing it for Behance

Record at **2560 × 1440** (or 1440 × 900 @2x) in Chrome, with the dev indicator off (use `npm run build && npm start`, not `dev`).

**Stills (desktop)**
1. **Cover** — hero with the cursor-light on the face (move the pointer to the eyes and wait 1 s). Crop to 1616 × 1264 with the wordmark crossing the aperture.
2. **Preloader at totality** — screenshot at ~2.3 s after load: black disc with corona on pure ink.
3. **Manifesto** mid-read — half the words lit.
4. **Collection** — scroll until Corona and Baily’s Beads are centred; hover one card for the caption state.
5. **Product panel** — Corona open, “Blackened brass” selected.
6. **Anatomy** — step 02 or 04 with the leader line drawn.
7. **Ledger** — the “146” row with both figures in frame.
8. **Instrument at totality** — drag the moon to the centre; the corona + “Totality.” + CTA is the strongest single frame of the site.
9. **Night Nº 07** — mid-transition between Second contact and Totality (the circular aperture half open).
10. **Fittings** after scrolling in (light returned) and the **footer** wordmark.

**Mobile** — Chrome device mode, 390 × 844 @3x: hero, manifesto, collection swipe row, instrument at totality, a product panel, the form. Place three or five screens in a row on `#E3DFD7` or `#0F0F10`.

**Motion clips** (Screen Studio / OBS, 60 fps, 8–15 s each)
- Load → preloader → hero intro → move the light across the face.
- Slow scroll from hero into manifesto (the moon eclipses the portrait).
- Collection walk (pinned horizontal) → open a product.
- Instrument: drag from first contact to totality, hold 2 s.
- Night Nº 07: one continuous scroll through the four contacts.

**Detail compositions** — the dial ring and wordmark (zoom 200 %), the edition dots and price line, the ledger numerals, the instrument readout, the menu with a hovered link widening.

---

## 6. Quality review

**What holds up**
- One idea (the eclipse) drives naming, imagery, interaction, transitions and copy — it reads as a brand, not a template.
- The first three seconds are authored: preloader eclipse → aperture portrait → cursor light.
- Four genuinely different interaction moments (light reveal, horizontal walk, annotation pin, shader instrument) plus a cinematic aperture sequence, without a single card grid.
- Static frames stay strong without motion; every section yields a portfolio still.

**Known limitations**
- Campaign stills are AI-generated (Krea 3). They are consistent but not photographed; product shots are 880 px wide (enough for cards and panels, not for full-bleed print).
- Frontend only: no payments, accounts or email delivery. Forms and the bag are simulated in the browser and say so.
- Browser QA was done in Chromium at 1440 × 900 and 375 × 812. Safari and Firefox were not tested; the CSS masks and the WebGL instrument are standard, but check them before presenting live.
- Reduced-motion and no-JS paths were built and reviewed in code, not emulated in a browser.
- No Lighthouse run was done. Three.js is a separate lazy chunk (~180 kB gzipped) fetched when the page hydrates; the rest of the app JS is ~250 kB gzipped across chunks.
- The custom cursor label can briefly show the previous label while a page scrolls under a still pointer; it corrects on the next frame.
