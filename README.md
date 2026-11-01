# simonfolio

Ayush Simon Barwa's portfolio, built like a DJ set: intro, tracks, B-side, outro.
The background follows the time of day and the weather in Bhubaneswar.

Built with Next.js (App Router), TypeScript, Tailwind CSS, GSAP (ScrollTrigger + SplitText) and Lenis.

## Open it in a browser

You need [Node.js](https://nodejs.org) 20 or newer and git.

```bash
git clone https://github.com/Ayush-Simon/simonfolio.git
cd simonfolio
npm install
npm run dev
```

Then open **http://localhost:3000**.

To run the production build instead:

```bash
npm run build
npm start
```

### Preview the sky

Add `?sky=` and `?weather=` to the URL to see any look without waiting for it:

- `?sky=dawn`, `day`, `dusk` or `night`
- `&weather=clear`, `clouds`, `fog`, `drizzle`, `rain`, `storm` or `snow`

For example: http://localhost:3000/?sky=night&weather=rain

## Edit the content

- `content/site.ts`: all the copy (hero, story, contact, socials, mix URL, city for the sky)
- `content/projects.ts`: projects in each track. Covers go in `public/work/`.

Anything marked `TODO` is a placeholder.

## Avatar

The avatars in `public/avatar/` are drawn by `avatar-src/build.py`, which writes SVGs and renders them to WebP (needs Python 3, Pillow and Google Chrome):

```bash
python3 avatar-src/build.py
```

## Deploy

It's a standard Next.js app, so it deploys to [Vercel](https://vercel.com/new) as is: import the repo and keep the default settings.
