"use client";

// The preloader resolves this when it has cleared the screen, so the hero
// can start its entrance at the right moment.
let resolveIntro: () => void = () => {};
export const introDone = new Promise<void>((r) => (resolveIntro = r));
export const finishIntro = () => resolveIntro();
