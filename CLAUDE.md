# Portfolio — simonfolio

Personal portfolio site. Minimal, aesthetic, personality-first. Inspired by the scroll-storytelling style of arjun-r.com, but with my own concept: **a DJ set**. The site plays like a set list — intro, tracks, B-side, outro.

## About me (source of truth for copy)
- Name: Ayush Simon Barwa (hero: "hey, i'm Ayush Simon Barwa"). The site is called simonfolio. Based in Bhubaneswar.
- College student. No corporate job — freelance work only. Don't invent companies, titles or testimonials.
- I build frontend websites, design posters, do brand identity, and a bit of system design.
- I DJ as a hobby.
- Tone: casual, lowercase-friendly, conversational, a little playful. Short lines. Like talking to a friend ("okay so… what do i actually make?").

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- GSAP + ScrollTrigger + SplitText (all free) for intro, text reveals, pinned scroll scenes
- Lenis for smooth scrolling (synced to ScrollTrigger)
- next/image for all images, WebP/AVIF
- Deploy on Vercel

## Design system
- Background off-white `#F5F3EE`, text near-black `#111`, ONE accent (pick a warm neon, e.g. `#FF4D2E`) used sparingly
- Fonts: one display (e.g. "Instrument Serif" or "PP Editorial"-style italic) + one clean sans (e.g. "Inter Tight"/"Geist")
- Huge type for story lines (clamp(2.5rem, 7vw, 6rem)), small mono labels for metadata (`TRACK 02 — 2025 · poster, brand`)
- Lots of whitespace. No gradients, no glassmorphism, no stock icons.

## Page structure
1. **Launch sequence (preloader, ~2s)** — a BPM counter ticks 000 → 128 (or a vinyl spins up), then splits away to reveal the hero. Only play the full version on first visit (sessionStorage), short fade after.
2. **Hero** — my Bitmoji avatar (`/public/avatar/wave.webp`) pops in with a spring + slight overshoot; name and one line stagger in word-by-word with a mask reveal. Avatar tilts subtly toward the mouse (parallax, max ~8deg).
3. **Story scroll** — one sentence broken across pinned scroll steps, each phrase revealed as you scroll (scrubbed):
   "i design things" → "and then i build them" → "so they look good" → "and actually work."
   Ends with: "okay so… what have i made?"
4. **Tracks (work)** — numbered like a tracklist:
   - TRACK 01 Frontend websites
   - TRACK 02 Posters
   - TRACK 03 Brand identity
   - TRACK 04 System design (small diagrams)
   Rows expand/scale on scroll into view. Hover: image preview follows the cursor, row text shifts, cursor becomes a "▶ play" pill. Posters get a 3D tilt on hover.
5. **B-side: the DJ** — avatar swaps to headphones pose (`/public/avatar/dj.webp`), a vinyl that spins faster while scrolling (velocity-linked), embedded mix (SoundCloud/Mixcloud iframe, lazy-loaded).
6. **How i work** — 3 short pillars with small interactive toys (e.g. a spacing slider, a color swatch you can click, "tap on me" reveals).
7. **Outro / contact** — "if this vibed, let's talk." Email with tap-to-copy + toast, socials. Avatar waves goodbye.

## Interaction rules
- Custom cursor: small dot, grows + shows a label over interactive items. Disabled on touch devices.
- Easter eggs over spectacle: tap-to-copy, tap-to-like, hidden hover states.
- Every animation must respect `prefers-reduced-motion` (fall back to simple fades / static).
- Mobile first-class: no pinned scenes that break on iOS; simplify scroll scenes under 768px.
- Performance: Lighthouse 90+; animate only transform/opacity; lazy-load below-fold media.

## Live sky background
- `components/Sky.tsx` + `lib/sky.ts` + `lib/sky-paint.ts`: the page background follows the time of day in Bhubaneswar (dawn, day, dusk, night; sun and moon move along an arc) and the live weather (clouds, fog, drizzle, rain, storm) from Open-Meteo (free, no key, cached 15 min). City/coords in `site.sky`.
- At night the colour tokens invert (dark sky, light text). The DJ panel (`deck`) and its arch (`chalk`) stay fixed.
- `paintSky` is inlined into `<head>` so the first paint has the right sky; keep it self-contained.
- Preview any look: `?sky=dawn|day|dusk|night&weather=clear|clouds|fog|drizzle|rain|storm|snow`.
- CSP `connect-src` allows `https://api.open-meteo.com` (next.config.ts).

## Content
- All copy lives in `/content/site.ts` so I can edit without touching components.
- Projects in `/content/projects.ts` (title, year, tags, cover, link, one-line story in my tone).
- Use placeholders clearly marked `TODO` where my real assets/text are missing.

## Working style
- Build one section at a time. After each section, run the dev server and check it in the browser before moving on.
- Keep components small: `Preloader`, `Hero`, `StoryScroll`, `Tracklist`, `DJSection`, `Pillars`, `Contact`, `Cursor`, `SmoothScroll`.
