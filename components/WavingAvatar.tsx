"use client";

import Image from "next/image";
import { forwardRef } from "react";

/**
 * The waving avatar, in two layers so the arm can actually wave.
 * Arm pivot = the shoulder (63% / 79% of the image).
 */
const WavingAvatar = forwardRef<HTMLDivElement, { priority?: boolean; className?: string; sizes?: string }>(
  function WavingAvatar({ priority, className = "", sizes = "(min-width: 768px) 40vw, 80vw" }, ref) {
    return (
      <div ref={ref} className={`relative aspect-square ${className}`}>
        {/* moonlight behind the avatar at night (transparent by day) */}
        <div aria-hidden className="sky-halo absolute -inset-[6%] rounded-full" />
        <Image
          src="/avatar/wave-arm.webp"
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="avatar-arm origin-[63%_79%] select-none object-contain"
          draggable={false}
        />
        <Image
          src="/avatar/wave-body.webp"
          alt="cartoon me, waving hello"
          fill
          sizes={sizes}
          priority={priority}
          className="select-none object-contain"
          draggable={false}
        />
      </div>
    );
  }
);

export default WavingAvatar;

/** Wave the arm a few times. Returns the tween so callers can chain it. */
export function wave(gsap: typeof import("gsap").gsap, scope: Element | null, times = 2) {
  const arm = scope?.querySelector(".avatar-arm");
  if (!arm) return;
  return gsap.fromTo(
    arm,
    { rotation: 0 },
    { rotation: -16, duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: times * 2 - 1, overwrite: true }
  );
}
