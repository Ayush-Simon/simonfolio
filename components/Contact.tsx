"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, SplitText, ScrollTrigger, MQ } from "@/lib/gsap";
import { site } from "@/content/site";
import WavingAvatar, { wave } from "./WavingAvatar";

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const avatar = useRef<HTMLDivElement>(null);
  const toast = useRef<HTMLDivElement>(null);
  const [copiedOnce, setCopiedOnce] = useState(false);
  const c = site.contact;

  useGSAP(
    () => {
      gsap.matchMedia().add(MQ.motion, () => {
        let split: SplitText | undefined;
        document.fonts.ready.then(() => {
          split = SplitText.create(".contact-heading", { type: "lines", mask: "lines" });
          gsap.from(split.lines, {
            yPercent: 110,
            stagger: 0.08,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: ".contact-heading", start: "top 80%" },
          });
        });
        gsap.from(".contact-fade", {
          y: 30,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".contact-fade", start: "top 90%" },
        });
        // wave goodbye every time you arrive at the end
        ScrollTrigger.create({
          trigger: avatar.current,
          start: "top 75%",
          onEnter: () => wave(gsap, avatar.current, 3),
          onEnterBack: () => wave(gsap, avatar.current, 2),
        });
        return () => split?.revert();
      });
    },
    { scope: root }
  );

  const copy = async () => {
    if (!(await copyText(c.email))) {
      window.location.href = `mailto:${c.email}`;
      return;
    }
    setCopiedOnce(true);
    const reduced = window.matchMedia(MQ.reduced).matches;
    gsap
      .timeline()
      .fromTo(toast.current, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: reduced ? 0 : 0.5, ease: "back.out(2)" })
      .to(toast.current, { autoAlpha: 0, y: 30, duration: reduced ? 0 : 0.3, ease: "power2.in" }, "+=1.8");
    if (!reduced) wave(gsap, avatar.current, 1);
  };

  return (
    <section id="contact" ref={root} className="pb-8 pt-24 md:pt-40">
      <div className="wrap flex flex-col items-center text-center">
        <div
          className="w-[min(60vw,260px)]"
          data-cursor="bye!"
          onPointerEnter={() => !window.matchMedia(MQ.reduced).matches && wave(gsap, avatar.current, 1)}
        >
          <WavingAvatar ref={avatar} sizes="260px" />
        </div>

        <h2 className="contact-heading mt-6 max-w-5xl font-display text-huge leading-[0.88] tracking-[-0.02em]">{c.heading}</h2>
        <p className="contact-fade mt-6 max-w-md text-lg text-ink/70">{c.sub}</p>

        <button type="button" onClick={copy} data-cursor={copiedOnce ? "copied" : "copy"} className="contact-fade btn mt-10 max-w-full text-[clamp(1.05rem,2.6vw,1.6rem)]">
          <span className="truncate">{c.email}</span>
        </button>
        <p className="contact-fade label mt-3">
          {c.copyHint}{" "}
          <a href={`mailto:${c.email}`} className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
            {c.mailApp}
          </a>
        </p>

        <ul className="contact-fade mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {c.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer" className="text-lg underline decoration-ink/20 underline-offset-4 hover:decoration-ink">
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        <footer className="mt-20 w-full border-t border-ink/15 pt-6">
          <p className="text-base">{c.footer}</p>
          <p className="label mt-1">
            © {new Date().getFullYear()} {site.name}
          </p>
        </footer>
      </div>

      <div
        ref={toast}
        role="status"
        className="invisible fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-paper opacity-0"
      >
        {c.copied}
      </div>
    </section>
  );
}

async function copyText(text: string) {
  // try the synchronous copy first, while we still have the click's user activation
  // (some embedded browsers deny the async clipboard API)
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {}
  ta.remove();
  if (ok) return true;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
