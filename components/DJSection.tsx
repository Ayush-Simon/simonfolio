"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger, MQ } from "@/lib/gsap";
import { site } from "@/content/site";

const BEAT = 60 / site.preloader.bpm;

export default function DJSection() {
  const root = useRef<HTMLElement>(null);
  const vinyl = useRef<SVGSVGElement>(null);
  const { heading, lines, mixEmbedUrl, vinylHint } = site.bside;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(".dj-avatar", {
          yPercent: 30,
          scale: 0.7,
          autoAlpha: 0,
          duration: 1.1,
          ease: "back.out(2)",
          scrollTrigger: { trigger: ".dj-avatar", start: "top 95%" },
        });
        // nod along at the set's tempo
        gsap.to(".dj-avatar-inner", { y: -8, rotation: 1.2, duration: BEAT / 2, ease: "sine.inOut", yoyo: true, repeat: -1 });

        gsap.from(".dj-reveal", {
          y: 40,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 70%" },
        });

        // 33⅓ rpm ≈ 1.8s per turn; scroll speed (and direction) scratches it
        const spin = gsap.to(vinyl.current, { rotation: "+=360", duration: 1.8, ease: "none", repeat: -1 });
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const v = self.getVelocity();
            const speed = gsap.utils.clamp(-8, 8, 1 + v / 350);
            gsap.to(spin, {
              timeScale: speed,
              duration: 0.2,
              overwrite: true,
              onComplete: () => {
                gsap.to(spin, { timeScale: 1, duration: 1.4, ease: "power2.out", overwrite: true });
              },
            });
          },
        });
      });
    },
    { scope: root }
  );

  return (
    <section id="b-side" ref={root} className="py-3">
      <div className="wrap">
        <div className="on-ink relative overflow-hidden rounded-[2rem] bg-deck px-5 py-20 text-center text-chalk md:px-10 md:py-28">
          <h2 className="dj-reveal font-display text-huge italic leading-[0.85]">{heading}</h2>

          <div className="relative mx-auto mt-12 w-full max-w-[560px]">
            {/* the record sits behind the avatar, on the side away from the speaker */}
            <div className="absolute -left-[18%] top-[4%] w-[58%]" data-cursor="scratch it">
              <Vinyl ref={vinyl} />
            </div>
            <div className="dj-avatar relative mx-auto w-full">
              {/* paper arch so the dark hair and tee read against the ink panel */}
              <div className="absolute inset-x-[6%] bottom-0 top-[4%] rounded-t-full bg-chalk" />
              <div className="dj-avatar-inner relative aspect-square">
                <Image src="/avatar/dj.webp" alt="cartoon me in headphones on a two-deck controller, a speaker banging beside me" fill sizes="(min-width: 768px) 560px, 90vw" className="object-contain" />
              </div>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-xl">
            {lines.map((l, i) => (
              <p key={i} className={`dj-reveal ${i === 0 ? "text-balance font-display text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.05]" : "mt-5 text-lg text-chalk/70"}`}>
                {l}
              </p>
            ))}
            <p className="dj-reveal mt-8 text-base text-chalk/60">{vinylHint}</p>
            <div className="dj-reveal mt-10">
              <MixEmbed url={mixEmbedUrl} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Vinyl({ ref }: { ref: React.Ref<SVGSVGElement> }) {
  const grooves = [92, 84, 76, 68, 60, 52];
  return (
    <svg ref={ref} viewBox="0 0 200 200" className="h-auto w-full" aria-hidden>
      <circle cx="100" cy="100" r="99" fill="var(--color-vinyl)" />
      {grooves.map((r) => (
        <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="var(--color-groove)" strokeWidth="1" />
      ))}
      {/* light catching the grooves, so you can see it turn */}
      <path d="M100 100 L100 6 A94 94 0 0 1 166 33 Z" fill="var(--color-shine)" />
      <path d="M100 100 L100 194 A94 94 0 0 1 34 167 Z" fill="var(--color-shine)" />
      <circle cx="100" cy="100" r="36" fill="var(--color-accent)" />
      <circle cx="100" cy="100" r="22" fill="none" stroke="var(--color-deck)" strokeOpacity="0.25" />
      <circle cx="100" cy="100" r="4" fill="var(--color-deck)" />
    </svg>
  );
}

/** Lazy-loads the mix player only once it's near the viewport. */
function MixEmbed({ url }: { url: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  const src = mixSrc(url);

  useEffect(() => {
    if (!src || !box.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(box.current);
    return () => io.disconnect();
  }, [src]);

  if (!src) {
    // Nothing to show visitors until a real (allowed) mix is added.
    if (process.env.NODE_ENV === "production") return null;
    return (
      <p className="rounded-xl border border-dashed border-chalk/30 p-5 text-sm text-chalk/60">
        {url ? "TODO (only visible in dev): that mix URL isn't a SoundCloud or Mixcloud player link, so it's blocked. " : "TODO (only visible in dev): "}
        paste a SoundCloud or Mixcloud embed URL into <code className="font-mono">site.bside.mixEmbedUrl</code> in content/site.ts
      </p>
    );
  }

  return (
    <div ref={box} className="overflow-hidden rounded-xl bg-chalk/5">
      {load ? (
        <iframe
          title="my latest mix"
          src={src}
          loading="lazy"
          allow="autoplay"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-[166px] w-full border-0"
        />
      ) : (
        <div className="h-[166px]" />
      )}
    </div>
  );
}

// Only these players may be embedded; keep in step with frame-src in next.config.ts.
const MIX_HOSTS = ["w.soundcloud.com", "player-widget.mixcloud.com"];

/** The embed URL if it's an https SoundCloud/Mixcloud player link, otherwise null. */
function mixSrc(url: string) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && MIX_HOSTS.includes(u.hostname) ? u.href : null;
  } catch {
    return null;
  }
}
