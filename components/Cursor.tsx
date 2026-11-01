"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, MQ } from "@/lib/gsap";

/**
 * Small dot that follows the pointer. Over anything with data-cursor="label"
 * it grows into a pill showing that label. Off on touch devices.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const mq = window.matchMedia(MQ.finePointer);
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled || !dot.current) return;
    const el = dot.current;
    document.documentElement.classList.add("has-cursor");
    const reduced = window.matchMedia(MQ.reduced).matches;
    const dur = reduced ? 0 : 0.35;
    const x = gsap.quickTo(el, "x", { duration: dur, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: dur, ease: "power3" });
    let shown = false;

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!shown) {
        gsap.set(el, { x: e.clientX, y: e.clientY });
        gsap.to(el, { autoAlpha: 1, duration: 0.2 });
        shown = true;
      }
      x(e.clientX);
      y(e.clientY);
      const target = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor], a, button, input");
      setLabel(target ? target.dataset.cursor ?? "" : "");
      el.dataset.hover = target ? "true" : "false";
    };
    const leave = () => {
      gsap.to(el, { autoAlpha: 0, duration: 0.2 });
      shown = false;
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dot}
      aria-hidden
      data-hover="false"
      className="group pointer-events-none fixed left-0 top-0 z-[100] invisible opacity-0"
    >
      <div
        className={`h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink transition-[transform,opacity] duration-300 ease-out ${
          label ? "scale-50" : "group-data-[hover=true]:scale-[3.2] group-data-[hover=true]:opacity-40"
        }`}
      />
      <span
        className={`absolute left-3 top-3 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-sm text-paper transition-[transform,opacity] duration-200 ease-out ${
          label ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
