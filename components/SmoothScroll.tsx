"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, MQ } from "@/lib/gsap";

declare global {
  interface Window {
    smoothScroll?: Lenis;
  }
}

/** Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export default function SmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia(MQ.motion).matches) return;

    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    window.smoothScroll = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete window.smoothScroll;
    };
  }, []);

  return null;
}
