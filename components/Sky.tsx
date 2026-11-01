"use client";

import { useEffect } from "react";
import { site } from "@/content/site";
import { paintSky } from "@/lib/sky-paint";
import { KINDS, fetchWeather, paintWeather, setWeather, type WeatherKind } from "@/lib/sky";

const { latitude, longitude, timezone, utcOffsetMin } = site.sky;

// fixed star field (deterministic, so server and client render the same)
const STARS = Array.from({ length: 32 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  // rounded to fixed strings so the server and browser print identical styles
  return {
    left: `${(r(1) * 100).toFixed(2)}%`,
    top: `${(r(2) * 62).toFixed(2)}%`,
    size: r(3) < 0.85 ? "1px" : "2px",
    twinkle: r(4) < 0.3,
    delay: `${(r(5) * 4).toFixed(2)}s`,
  };
});

/**
 * The page background: a sky gradient for Bhubaneswar's time of day (dawn, day, dusk, night)
 * with the sun or moon in the right place, plus clouds, fog, rain or a storm from the live weather.
 */
export default function Sky() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceSky = params.get("sky");
    const forceWeather = params.get("weather") as WeatherKind | null;
    let rise: number | null = null;
    let set: number | null = null;
    let cancelled = false;

    const repaint = () => paintSky(utcOffsetMin, rise, set, forceSky);
    const load = async () => {
      const w = await fetchWeather(latitude, longitude, timezone);
      if (cancelled) return;
      if (w) {
        rise = w.rise;
        set = w.set;
        repaint();
      }
      if (forceWeather && KINDS.includes(forceWeather)) {
        paintWeather(forceWeather, forceWeather === "clear" ? 5 : 85);
      } else if (w) {
        paintWeather(w.kind, w.cloud);
      }
      setWeather(w);
    };

    repaint();
    load();
    const tick = window.setInterval(repaint, 60_000);
    const refresh = window.setInterval(load, 15 * 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(tick);
      window.clearInterval(refresh);
    };
  }, []);

  return (
    <div aria-hidden className="sky">
      <div className="sky-grad sky-dawn" />
      <div className="sky-grad sky-day" />
      <div className="sky-grad sky-dusk" />
      <div className="sky-grad sky-night" />
      <div className="sky-stars">
        {STARS.map((s, i) => (
          <i
            key={i}
            className={s.twinkle ? "twinkle" : undefined}
            style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay }}
          />
        ))}
      </div>
      <div className="sky-sun" />
      <div className="sky-moon" />
      <div className="sky-clouds">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="sky-wash" />
      <div className="sky-rain" />
      <div className="sky-flash" />
    </div>
  );
}
