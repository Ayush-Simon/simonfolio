// No "use client": the layout inlines paintSky into <head> as a string, so it must stay
// self-contained (no imports, no outside references).

export type Phase = "dawn" | "day" | "dusk" | "night";

/**
 * Sets data-sky (dawn/day/dusk/night) and the sun and moon positions on <html>.
 * Self-contained on purpose: it is also inlined into <head> so the first paint
 * already has the right sky. rise/set are minutes after local midnight; without
 * them it uses Bhubaneswar's typical sunrise/sunset for the month.
 */
export function paintSky(utcOffsetMin: number, rise?: number | null, set?: number | null, force?: string | null) {
  const now = Date.now();
  const mins = (((now / 60000 + utcOffsetMin) % 1440) + 1440) % 1440;
  if (rise == null || set == null) {
    const month = new Date(now + utcOffsetMin * 60000).getUTCMonth();
    const R = [6.3, 6.2, 5.9, 5.5, 5.2, 5.1, 5.2, 5.4, 5.6, 5.75, 5.95, 6.2];
    const S = [17.4, 17.75, 18.0, 18.1, 18.3, 18.5, 18.5, 18.3, 17.9, 17.4, 17.1, 17.1];
    rise = R[month] * 60;
    set = S[month] * 60;
  }
  let phase = mins < rise - 50 || mins >= set + 50 ? "night" : mins < rise + 80 ? "dawn" : mins < set - 80 ? "day" : "dusk";
  if (force === "dawn" || force === "day" || force === "dusk" || force === "night") phase = force;

  // sun: rises bottom-left, peaks near the top at noon, sets bottom-right
  let p = (mins - rise) / (set - rise);
  if (force) p = phase === "dawn" ? 0.04 : phase === "day" ? 0.45 : phase === "dusk" ? 0.96 : -0.3;
  const sp = Math.min(Math.max(p, 0), 1);
  const sunX = 6 + Math.min(Math.max(p, -0.08), 1.08) * 88;
  const sunY = p < 0 ? 72 - p * 120 : p > 1 ? 72 + (p - 1) * 120 : 72 - Math.sin(Math.PI * sp) * 60;
  // moon: the same arc across the night
  let q = ((mins - set + 1440) % 1440) / (1440 - (set - rise));
  if (force) q = phase === "night" ? 0.35 : 1.3;
  const qp = Math.min(Math.max(q, 0), 1);
  const moonX = 6 + qp * 88;
  const moonY = q > 1 ? 130 : 70 - Math.sin(Math.PI * qp) * 55;

  const el = document.documentElement;
  el.dataset.sky = phase;
  el.style.setProperty("--sun-x", sunX.toFixed(2) + "vw");
  el.style.setProperty("--sun-y", sunY.toFixed(2) + "vh");
  el.style.setProperty("--moon-x", moonX.toFixed(2) + "vw");
  el.style.setProperty("--moon-y", moonY.toFixed(2) + "vh");
  return phase;
}

