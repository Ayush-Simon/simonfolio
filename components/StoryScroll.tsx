"use client";

import { useRef } from "react";
import { gsap, useGSAP, SplitText, MQ } from "@/lib/gsap";
import { site } from "@/content/site";

/**
 * One sentence, revealed phrase by phrase as you scroll.
 * Desktop: pinned + scrubbed. Mobile: each phrase fades in on its own (no pin, iOS-safe).
 */
export default function StoryScroll() {
  const root = useRef<HTMLElement>(null);
  const { phrases, question } = site.story;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(`${MQ.motion} and ${MQ.desktop}`, () => {
        const splits = gsap.utils
          .toArray<HTMLElement>(".story-phrase")
          .map((el) => SplitText.create(el, { type: "words" }));
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${window.innerHeight * (phrases.length + 1)}`,
            pin: ".story-pin",
            scrub: 0.6,
          },
        });
        splits.forEach((s, i) => {
          tl.fromTo(s.words, { opacity: 0.12 }, { opacity: 1, stagger: 0.12, duration: 0.5 }, i);
        });
        tl.from(".story-q", { yPercent: 100, opacity: 0, duration: 0.6, ease: "power2.out" }, phrases.length).to({}, { duration: 0.4 });
        return () => splits.forEach((s) => s.revert());
      });

      mm.add(`${MQ.motion} and ${MQ.mobile}`, () => {
        gsap.utils.toArray<HTMLElement>(".story-phrase, .story-q").forEach((el) => {
          gsap.from(el, {
            opacity: 0.12,
            y: 24,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          });
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} aria-label="about me, in one sentence">
      <div className="story-pin flex min-h-svh flex-col justify-center py-24">
        <div className="wrap text-center">
          <h2 className="font-display text-story leading-[0.98] tracking-[-0.015em]">
            {phrases.map((p) => (
              <span key={p} className="story-phrase block">
                {p}
              </span>
            ))}
          </h2>
          <div className="mt-12 overflow-hidden md:mt-16">
            <p className="story-q text-2xl md:text-4xl">{question}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
