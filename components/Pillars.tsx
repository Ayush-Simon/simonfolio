"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { site } from "@/content/site";

export default function Pillars() {
  const root = useRef<HTMLElement>(null);
  const { heading, items } = site.pillars;

  useGSAP(
    () => {
      gsap.matchMedia().add(MQ.motion, () => {
        gsap.from(".pillar", {
          y: 60,
          autoAlpha: 0,
          stagger: 0.12,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: ".pillars-grid", start: "top 80%" },
        });
      });
    },
    { scope: root }
  );

  const toys = [<SpacingToy key="s" />, <SwatchToy key="c" />, <TapToy key="t" />];

  return (
    <section ref={root} className="py-24 md:py-40">
      <div className="wrap text-center">
        <h2 className="mb-12 font-display text-story leading-none md:mb-20">{heading}</h2>
        <div className="pillars-grid grid gap-x-6 gap-y-14 md:grid-cols-3">
          {items.map((it, i) => (
            <article key={it.title} className="pillar flex flex-col items-center">
              <div className="grid min-h-56 w-full place-items-center rounded-2xl bg-line p-6">{toys[i]}</div>
              <h3 className="mt-6 font-display text-3xl italic">{it.title}</h3>
              <p className="mt-2 max-w-xs text-base text-ink/70">{it.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpacingToy() {
  const [space, setSpace] = useState(12);
  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="flex items-end" style={{ gap: space }}>
        <i className="h-12 w-6 rounded-sm bg-ink" />
        <i className="h-16 w-6 rounded-sm bg-accent" />
        <i className="h-9 w-6 rounded-sm bg-ink" />
      </div>
      <p className="font-display text-2xl italic" style={{ letterSpacing: space / 14 + "px" }}>
        breathe
      </p>
      <label className="flex w-full items-center gap-3">
        <span className="sr-only">spacing</span>
        <input
          type="range"
          min={0}
          max={48}
          value={space}
          onChange={(e) => setSpace(+e.target.value)}
          data-cursor="drag"
          className="w-full accent-[var(--color-ink)]"
        />
        <span className="label w-12 text-right tabular-nums">{space}px</span>
      </label>
    </div>
  );
}

const SWATCHES = [
  { name: "red", bg: "bg-accent", text: "text-accent-ink" },
  { name: "blue", bg: "bg-swatch-blue", text: "text-paper" },
  { name: "green", bg: "bg-swatch-green", text: "text-paper" },
  { name: "yellow", bg: "bg-swatch-yellow", text: "text-ink" },
  { name: "ink", bg: "bg-ink", text: "text-paper" },
];

function SwatchToy() {
  const [c, setC] = useState(SWATCHES[0]);
  const card = useRef<HTMLDivElement>(null);
  const pick = (s: (typeof SWATCHES)[number]) => {
    setC(s);
    if (!window.matchMedia(MQ.reduced).matches) {
      gsap.fromTo(card.current, { scale: 0.92 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
    }
  };
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div ref={card} className={`flex h-20 w-full max-w-52 items-end justify-between rounded-lg px-4 pb-4 pt-3 transition-colors duration-300 ${c.bg} ${c.text}`}>
        <span className="text-sm">{c.name}</span>
        <span className="font-display text-3xl italic leading-none">aa</span>
      </div>
      <div className="flex gap-2.5">
        {SWATCHES.map((s) => (
          <button
            key={s.name}
            type="button"
            onClick={() => pick(s)}
            aria-label={`use ${s.name}`}
            aria-pressed={c.name === s.name}
            data-cursor="pick"
            className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${s.bg} ${c.name === s.name ? "scale-110 border-ink" : "border-transparent"}`}
          />
        ))}
      </div>
    </div>
  );
}

const TAPS = ["hi :)", "you found a detail.", "okay, one more?", "that's the whole trick.", "go on, say hi."];

function TapToy() {
  const [n, setN] = useState(0);
  const msg = useRef<HTMLParagraphElement>(null);
  const tap = () => {
    setN((x) => x + 1);
    if (!window.matchMedia(MQ.reduced).matches) {
      requestAnimationFrame(() =>
        gsap.fromTo(msg.current, { y: 14, autoAlpha: 0, rotation: -4 }, { y: 0, autoAlpha: 1, rotation: 0, duration: 0.5, ease: "back.out(3)" })
      );
    }
  };
  return (
    <div className="flex flex-col items-center gap-4">
      <button type="button" onClick={tap} data-cursor="tap!" className="btn">
        tap on me
      </button>
      <p ref={msg} aria-live="polite" className="h-7 font-display text-2xl italic">
        {n > 0 ? TAPS[(n - 1) % TAPS.length] : ""}
      </p>
      <span className="label tabular-nums">taps: {n}</span>
    </div>
  );
}
