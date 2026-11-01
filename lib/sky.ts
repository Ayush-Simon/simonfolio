"use client";

import { useSyncExternalStore } from "react";

export type { Phase } from "./sky-paint";
export type WeatherKind = "clear" | "clouds" | "fog" | "drizzle" | "rain" | "storm" | "snow";
export type Weather = { kind: WeatherKind; label: string; temp: number; cloud: number; rise: number; set: number };

export const PHASES = ["dawn", "day", "dusk", "night"] as const;
export const KINDS: WeatherKind[] = ["clear", "clouds", "fog", "drizzle", "rain", "storm", "snow"];

export function paintWeather(kind: WeatherKind, cloud: number) {
  const el = document.documentElement;
  el.dataset.weather = kind;
  el.style.setProperty("--cloudiness", String(Math.min(Math.max(cloud, 0), 100) / 100));
}

/** WMO weather codes, as Open-Meteo reports them. */
export function describe(code: number): { kind: WeatherKind; label: string } {
  if (code === 0) return { kind: "clear", label: "clear sky" };
  if (code === 1) return { kind: "clear", label: "mostly clear" };
  if (code === 2) return { kind: "clouds", label: "partly cloudy" };
  if (code === 3) return { kind: "clouds", label: "overcast" };
  if (code === 45 || code === 48) return { kind: "fog", label: "foggy" };
  if (code >= 51 && code <= 57) return { kind: "drizzle", label: "drizzle" };
  if (code === 61 || code === 80) return { kind: "drizzle", label: "light rain" };
  if (code === 63 || code === 66 || code === 81) return { kind: "rain", label: "rain" };
  if (code === 65 || code === 67 || code === 82) return { kind: "rain", label: "heavy rain" };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { kind: "snow", label: "snow" };
  if (code >= 95) return { kind: "storm", label: "thunderstorm" };
  return { kind: "clouds", label: "cloudy" };
}

const toMinutes = (iso: string) => {
  const [h, m] = iso.slice(11, 16).split(":").map(Number);
  return h * 60 + m;
};

const CACHE_KEY = "sky-weather";
const MAX_AGE = 15 * 60 * 1000;

/** Current weather + today's sunrise/sunset from Open-Meteo (free, no key). Cached for 15 minutes. */
export async function fetchWeather(lat: number, lon: number, timezone: string): Promise<Weather | null> {
  try {
    const hit = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
    if (hit && Date.now() - hit.t < MAX_AGE) return hit.w as Weather;
  } catch {}
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code,cloud_cover&daily=sunrise,sunset&forecast_days=1&timezone=${encodeURIComponent(timezone)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    const code = Number(d?.current?.weather_code);
    const temp = Number(d?.current?.temperature_2m);
    const cloud = Number(d?.current?.cloud_cover);
    const rise = d?.daily?.sunrise?.[0];
    const set = d?.daily?.sunset?.[0];
    if (!Number.isFinite(code) || typeof rise !== "string" || typeof set !== "string") return null;
    const w: Weather = { ...describe(code), temp, cloud: Number.isFinite(cloud) ? cloud : 0, rise: toMinutes(rise), set: toMinutes(set) };
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), w }));
    } catch {}
    return w;
  } catch {
    return null;
  }
}

// tiny store so the hero caption can read what the sky fetched
let current: Weather | null = null;
const listeners = new Set<() => void>();
export function setWeather(w: Weather | null) {
  current = w;
  listeners.forEach((l) => l());
}
export function useWeather() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => null
  );
}
