# Portfolio — Anusha

Personal portfolio site. Minimal, aesthetic, personality-first. Inspired by the scroll-storytelling style of arjun-r.com, but with my own concept: **a DJ set**. The site plays like a set list — intro, tracks, B-side, outro.

## About me (source of truth for copy)
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

## Reference effects (observed on arjun-r.com — recreate the feel, not the content)
- **Intro:** the hero sentence types in word by word. Unrevealed words sit as faint grey "ghost" text that darkens as they arrive. A Figma-style multiplayer cursor with a name tag glides across the text while it writes.
- **Payoff word:** the last phrase lands in a hand-drawn marker-pill highlight, with little googly eyes popping in beside it.
- **Doodle layer:** hand-drawn sketchy lines, handwritten side notes ("Hi, I'm…", "okay so… how do i do that?"), a sunburst of strokes around the avatar, sparkle/star stickers. Use SVG paths with `stroke-dasharray` draw-on animations.
- **Avatar:** sits under the hero, centered, with radiating lines. Scrolling pins it while "Here's how" comes up with a scribble underline drawn in.
- **Nav:** a minimal logo plus a pill nav (icons + labels) that appears after the hero.
- **Project rows:** alternate text left/right. Cards are slightly rotated, lift and tilt on hover, and sparkle stickers burst out of the corners.
- **Blur-in reveal:** headings start blurred/faded and sharpen as they scroll into view.
- **Testimonials → chat:** a chat bubble quote above a row of tilted photo cards; tapping a face swaps the quote. (For me: swap in freelance client quotes, or skip.)
- **"I experiment a lot" collage:** a pile of tilted cards that fan out on scroll around a sticker badge. (For me: posters + brand work.)
- **Story path:** a hand-drawn line draws itself across the screen on scroll with handwritten labels at each node ("who", "AI").

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

## Content
- All copy lives in `/content/site.ts` so I can edit without touching components.
- Projects in `/content/projects.ts` (title, year, tags, cover, link, one-line story in my tone).
- Use placeholders clearly marked `TODO` where my real assets/text are missing.

## Working style
- Build one section at a time. After each section, run the dev server and check it in the browser before moving on.
- Keep components small: `Preloader`, `Hero`, `StoryScroll`, `Tracklist`, `DJSection`, `Pillars`, `Contact`, `Cursor`, `SmoothScroll`.
