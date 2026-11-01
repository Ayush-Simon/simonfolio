"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { useWeather } from "@/lib/sky";

const fmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: site.sky.timezone });

/** "9:41 pm in bhubaneswar, clear sky, 24°c": the real time and weather the background is drawn from. */
export default function SkyCaption({ className = "" }: { className?: string }) {
  const weather = useWeather();
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(fmt.format(new Date()).toLowerCase().replace(/\s/g, " "));
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!time) return <p className={className}>&nbsp;</p>;
  const parts = [`${time} in ${site.sky.city}`];
  if (weather) parts.push(weather.label, `${Math.round(weather.temp)}°c`);
  return <p className={className}>{parts.join(", ")}</p>;
}
