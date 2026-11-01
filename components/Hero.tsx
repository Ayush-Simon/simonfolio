"use client";

import { useRef } from "react";
import { gsap, useGSAP, SplitText, MQ } from "@/lib/gsap";
import { introDone } from "@/lib/intro";
import { site } from "@/content/site";
import WavingAvatar, { wave } from "./WavingAvatar";
import SkyCaption from "./SkyCaption";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const avatar = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const { hello, line, action, secondary } = site.hero;

  useGSAP(
    (_, contextSafe) => {
      const reduced = window.matchMedia(MQ.reduced).matches;
      const lines = gsap.utils.toArray<HTMLElement>(".hero-split");
      let cancelled = false;

      // hidden only once scripts run, so the page reads without them
      gsap.set([avatar.current, ".hero-fade", ...lines], { autoAlpha: 0 });

      Promise.all([introDone, document.fonts.ready]).then(
        contextSafe!(() => {
          if (cancelled) return;
          if (reduced) {
            gsap.to([avatar.current, ".hero-fade", ...lines], { autoAlpha: 1, duration: 0.6 });
            return;
          }

          // reveal whole lines, not single words, so word spacing and kerning stay natural
          const splits = lines.map((el) => SplitText.create(el, { type: "lines", mask: "lines" }));
          gsap.set(lines, { autoAlpha: 1 });

          gsap
            .timeline({ defaults: { ease: "expo.out" } })
            .fromTo(
              avatar.current,
              { autoAlpha: 0, scale: 0.4, y: 60, rotation: -8 },
              { autoAlpha: 1, scale: 1, y: 0, rotation: 0, duration: 1.1, ease: "back.out(2.2)" }
            )
            .from(
              splits.flatMap((s) => s.lines),
              { yPercent: 110, duration: 1, stagger: 0.08, onComplete: () => splits.forEach((s) => s.revert()) },
              0.15
            )
            .to(".hero-fade", { autoAlpha: 1, duration: 0.6 }, 0.6)
            .add(() => {
              wave(gsap, avatar.current, 2);
            }, 0.8);
        })
      );

      // avatar leans toward the mouse (max ~8deg)
      gsap.matchMedia().add(`${MQ.motion} and ${MQ.finePointer}`, () => {
        const rx = gsap.quickTo(tilt.current, "rotationX", { duration: 0.8, ease: "power3" });
        const ry = gsap.quickTo(tilt.current, "rotationY", { duration: 0.8, ease: "power3" });
        const move = (e: PointerEvent) => {
          ry((e.clientX / window.innerWidth - 0.5) * 16);
          rx(-(e.clientY / window.innerHeight - 0.5) * 16);
        };
        window.addEventListener("pointermove", move, { passive: true });
        return () => window.removeEventListener("pointermove", move);
      });

      return () => {
        cancelled = true;
      };
    },
    { scope: root }
  );

  const waveAgain = () => {
    if (!window.matchMedia(MQ.reduced).matches) wave(gsap, avatar.current, 2);
  };

  return (
    <section id="top" ref={root} className="flex min-h-svh flex-col justify-center pb-12 pt-24">
      <div className="wrap flex flex-col items-center text-center">
        <div className="w-[clamp(190px,34vh,330px)]" style={{ perspective: 900 }}>
          <div ref={tilt} className="will-change-transform">
            <div onPointerEnter={waveAgain} onClick={waveAgain} data-cursor="hi!">
              <WavingAvatar ref={avatar} priority sizes="330px" />
            </div>
          </div>
        </div>

        <p className="hero-split mt-4 font-display text-[clamp(1.5rem,2.8vw,2.4rem)] italic leading-none">{hello}</p>
        <h1 className="hero-split max-w-5xl font-display text-[clamp(3.2rem,9vw,8rem)] leading-[0.92] tracking-[-0.01em] [word-spacing:-0.02em]">
          {site.owner}
        </h1>
        <p className="hero-split mt-5 max-w-md text-lg leading-snug md:text-xl">{line}</p>

        <div className="hero-fade mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <a href={action.href} className="btn">
            {action.label}
          </a>
          <a href={secondary.href} className="text-base underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
            {secondary.label}
          </a>
        </div>
        <SkyCaption className="hero-fade label mt-8" />
      </div>
    </section>
  );
}
