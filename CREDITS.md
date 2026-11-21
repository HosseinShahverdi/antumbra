# Credits & asset provenance

## Brand
**Antumbra** is a fictional brand created for this portfolio concept. Its name, mark, products, prices, copy and the “Lisbon atelier” are invented. It is not affiliated with any real company.

## Reference
High-level art-direction cues (monochrome palette, extended display caps, gothic couture headwear, dark editorial pacing) were taken from a Behance moodboard: *“UX/UI design, website, web design”* by Kristina Prosvirnina (behance.net/gallery/251842091). No images, layouts, code, identity or copy from it were reused.

## Campaign imagery — original, AI-generated
All 17 stills were generated on 21 Nov 2026 for this project with **Krea 3** through an ElevenLabs creative flow (“Antumbra — campaign stills”), then processed with `scripts/process-images.mjs`. Raw PNGs live in `assets-src/` (not shipped). The people pictured are generated, not real models, and are never presented as customers, staff or endorsers.

Shared style anchor in every prompt: *black-and-white fine-art fashion photograph on medium-format film, visible silver-halide grain, rich charcoal-to-silver tonal range, deep black shadows, single hard key light, seamless dark charcoal backdrop, couture editorial for an avant-garde millinery atelier* (cinematic frames used a “35 mm anamorphic film still” anchor instead).

| File (slug) | Size | Subject |
| --- | --- | --- |
| `hero` | 2048² | Front portrait, eyes closed, large matte-black disc behind the head with a thin rim of light (eclipse halo) |
| `annulus` | 880×1168 | Shaved-head profile with a single thin tilted ring halo |
| `corona` | 880×1168 | Three-quarter portrait, crown of fine black filaments radiating from a disc |
| `bailys-beads` | 880×1168 | Eyes closed, arc of graduated black and silver beads over the crown |
| `diamond-ring` | 880×1168 | Looking down, matte black brow band with one bright crystal |
| `penumbra` | 880×1168 | Flat black halo brim with a graduated tulle veil over the eyes |
| `umbra` | 880×1168 | Small black disc on a wire covering one eye |
| `second-contact` | 880×1168 | Profile with a thick crescent-shaped headpiece |
| `chromosphere` | 880×934 | Huge pleated organza disc framing the face (cropped to the ruff) |
| `anatomy` | 912×1136 | Still life: the Corona crown on a black plaster head and plinth |
| `contact-hall` | 2720×1536 | Lone figure in a brutalist hall beside a shaft of light |
| `contact-hands` | 1360×768 | Gloved hands lowering a filament crown onto a model |
| `totality` | 2720×1536 | Silhouette before a glowing disc, headpiece aligned like an eclipse |
| `contact-corridor` | 2720×1536 | Figure walking down a stone corridor toward a doorway of light |
| `atelier-hands` | 912×1136 | Hands filing a blackened-brass filament at a workbench |
| `material-macro` | 1360×768 | Macro of filaments and beads in a radial burst on velvet |
| `closing` | 2720×1536 | Low-key profile lit by a thin crescent of light |

`public/og.jpg` is a 1200×630 crop of `totality`.

## Type (Google Fonts, SIL Open Font License 1.1)
- **Anybody** — Tyler Finck / ETC
- **Instrument Serif** — Instrument
- **Geist**, **Geist Mono** — Vercel

## Icons
**Solar** icon set by 480 Design, via Iconify (`@iconify-json/solar`), CC BY 4.0. 19 icons are copied into `src/lib/icons.generated.ts`.

## Code libraries
Next.js, React (MIT) · Tailwind CSS (MIT) · GSAP & ScrollTrigger (GreenSock Standard “No Charge” License) · Lenis (MIT) · Three.js (MIT) · sharp (Apache-2.0).

## Authored graphics
The eclipse brand mark, favicon, dial ring (CSS conic gradients), grain texture (SVG noise filter) and the eclipse shader are authored in code for this project.
