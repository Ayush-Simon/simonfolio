"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { finishIntro } from "@/lib/intro";
import { site } from "@/content/site";

const SEEN_KEY = "intro-played";

// decided once per page load (effects run twice in dev strict mode)
let firstVisit: boolean | null = null;
function isFirstVisit() {
  if (firstVisit === null) {
    try {
      firstVisit = sessionStorage.getItem(SEEN_KEY) !== "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      firstVisit = true;
    }
  }
  return firstVisit;
}

/** BPM counter 000 → 128, then the screen splits open. Full version once per session. */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      const seen = !isFirstVisit();
      const reduced = window.matchMedia(MQ.reduced).matches;

      window.smoothScroll?.stop();
      const done = () => {
        window.smoothScroll?.start();
        setGone(true);
      };

      if (seen || reduced) {
        if (num.current) num.current.textContent = String(site.preloader.bpm);
        gsap.to(root.current, { autoAlpha: 0, duration: 0.45, delay: 0.15, onStart: finishIntro, onComplete: done });
        return;
      }

      const count = { v: 0 };
      gsap
        .timeline({ onComplete: done })
        .from(".pre-ui", { autoAlpha: 0, y: 12, duration: 0.3, stagger: 0.05 })
        .to(count, {
          v: site.preloader.bpm,
          duration: 1.3,
          ease: "power2.inOut",
          onUpdate: () => {
            if (num.current) num.current.textContent = String(Math.round(count.v)).padStart(3, "0");
          },
        }, 0.1)
        .to(".pre-bar", { scaleX: 1, duration: 1.3, ease: "power2.inOut" }, 0.1)
        .to(".pre-vinyl", { rotation: 720, duration: 1.4, ease: "power2.in" }, 0.1)
        .to(".pre-ui", { autoAlpha: 0, y: -10, duration: 0.25, stagger: 0.03 }, "+=0.15")
        .addLabel("split")
        .add(finishIntro, "split+=0.15")
        .to(".pre-top", { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, "split")
        .to(".pre-bottom", { yPercent: 100, duration: 0.8, ease: "expo.inOut" }, "split");
    },
    { scope: root }
  );

  if (gone) return null;

  return (
    <div ref={root} id="preloader" className="fixed inset-0 z-[90] text-paper" aria-hidden>
      <noscript>
        <style>{`#preloader{display:none}`}</style>
      </noscript>
      <div className="pre-top absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div className="pre-bottom absolute inset-x-0 bottom-0 h-1/2 bg-ink" />

      <div className="relative flex h-full flex-col items-center justify-center gap-6">
        <svg className="pre-ui pre-vinyl h-14 w-14" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="27" fill="var(--color-vinyl)" stroke="var(--color-groove)" />
          <circle cx="28" cy="28" r="19" fill="none" stroke="var(--color-groove)" />
          <circle cx="28" cy="28" r="13" fill="none" stroke="var(--color-groove)" />
          <circle cx="28" cy="28" r="8" fill="var(--color-accent)" />
          <circle cx="28" cy="28" r="1.8" fill="var(--color-ink)" />
          <rect x="26.5" y="21" width="3" height="4" rx="1" fill="var(--color-ink)" />
        </svg>
        <div className="pre-ui flex items-baseline gap-3">
          <span ref={num} className="font-mono text-[clamp(4rem,16vw,10rem)] leading-none tabular-nums tracking-tight">
            000
          </span>
          <span className="text-base text-accent">{site.preloader.label}</span>
        </div>
        <div className="pre-ui h-px w-48 bg-paper/15">
          <div className="pre-bar h-full origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </div>
  );
}
