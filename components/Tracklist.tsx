"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger, MQ } from "@/lib/gsap";
import { tracks, type Project, type Track } from "@/content/projects";
import { site } from "@/content/site";
import Cover from "./Cover";

export default function Tracklist() {
  const root = useRef<HTMLElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [hovered, setHovered] = useState<Track | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // rows grow into place as they scroll in
      mm.add(MQ.motion, () => {
        gsap.from(".tracks-head > *", {
          y: 30,
          opacity: 0,
          stagger: 0.08,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".tracks-head", start: "top 85%" },
        });
        gsap.utils.toArray<HTMLElement>(".track-row").forEach((row) => {
          gsap.fromTo(
            row,
            { scale: 0.9, opacity: 0.15 },
            {
              scale: 1,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: { trigger: row, start: "top 95%", end: "top 65%", scrub: 0.5 },
            }
          );
        });
      });

      // a preview of the track follows the cursor over its row
      mm.add(`${MQ.motion} and ${MQ.finePointer}`, () => {
        const el = preview.current!;
        const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
        const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
        const r = gsap.quickTo(el, "rotation", { duration: 0.6, ease: "power3" });
        let lastX = 0;
        const move = (e: PointerEvent) => {
          x(e.clientX);
          y(e.clientY);
          r(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
          lastX = e.clientX;
        };
        window.addEventListener("pointermove", move, { passive: true });
        return () => window.removeEventListener("pointermove", move);
      });
    },
    { scope: root }
  );

  useEffect(() => {
    const el = preview.current?.firstElementChild;
    if (!el) return;
    gsap.to(el, {
      scale: hovered ? 1 : 0.6,
      autoAlpha: hovered ? 1 : 0,
      duration: 0.35,
      ease: hovered ? "back.out(2)" : "power2.in",
    });
  }, [hovered]);

  return (
    <section id="tracks" ref={root} className="pb-24 pt-16 md:pb-40">
      <div className="wrap">
        <div className="tracks-head mb-10 text-center md:mb-16">
          <h2 className="font-display text-story italic leading-none">{site.tracks.heading}</h2>
          <p className="label mt-4">{site.tracks.hint}</p>
        </div>

        <ol className="border-b border-ink/15">
          {tracks.map((t) => (
            <TrackRow
              key={t.id}
              track={t}
              open={open === t.id}
              onToggle={() => setOpen((o) => (o === t.id ? null : t.id))}
              onHover={(h) => setHovered(h ? t : null)}
            />
          ))}
        </ol>
      </div>

      <div ref={preview} aria-hidden className="pointer-events-none fixed left-0 top-0 z-40 hidden [@media(hover:hover)]:block">
        <div className="invisible relative ml-8 -mt-[110px] h-[220px] w-[180px] overflow-hidden rounded-lg opacity-0 shadow-[0_20px_50px_-20px_var(--color-shadow)]">
          {hovered && <TrackPreview track={hovered} />}
        </div>
      </div>
    </section>
  );
}

/** The hovered track's first real cover, or the track set in type until there is one. */
function TrackPreview({ track }: { track: Track }) {
  const withCover = track.projects.find((p) => p.cover);
  if (withCover) return <Cover project={withCover} sizes="180px" />;
  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-ink p-4 text-left text-paper">
      <span className="font-mono text-sm tabular-nums text-accent">{track.number}</span>
      <span className="font-display text-[2.4rem] italic leading-[0.9]">{track.title}</span>
      <span className="text-sm text-paper/70">
        {track.projects.length} {track.projects.length === 1 ? "cut" : "cuts"}
      </span>
    </div>
  );
}

function PlayIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
      {open ? <rect x="3" y="3" width="10" height="10" rx="1" fill="currentColor" /> : <path d="M4.5 2.5v11l9-5.5z" fill="currentColor" />}
    </svg>
  );
}

function TrackRow({
  track,
  open,
  onToggle,
  onHover,
}: {
  track: Track;
  open: boolean;
  onToggle: () => void;
  onHover: (h: boolean) => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const years = track.projects.map((p) => p.year);
  const lo = Math.min(...years);
  const hi = Math.max(...years);
  const count = track.projects.length;
  const meta = `${count} ${count === 1 ? "cut" : "cuts"}, ${lo === hi ? lo : `${lo} to ${hi}`}`;
  const panelId = `track-${track.id}`;

  // open without animating height: the cards rise in instead
  useEffect(() => {
    ScrollTrigger.refresh();
    if (!open || !panel.current || window.matchMedia(MQ.reduced).matches) return;
    gsap.from(panel.current.querySelectorAll("article"), { y: 30, opacity: 0, stagger: 0.07, duration: 0.6, ease: "power3.out" });
  }, [open]);

  return (
    <li className="track-row border-t border-ink/15">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          onToggle();
          onHover(false);
        }}
        onPointerEnter={(e) => e.pointerType === "mouse" && !open && onHover(true)}
        onPointerLeave={() => onHover(false)}
        data-cursor={open ? "close" : "play"}
        className="group grid w-full grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-3 py-6 text-center md:grid-cols-[4rem_minmax(0,1fr)_4rem] md:py-9"
      >
        <span className="justify-self-start font-mono text-sm tabular-nums text-mute">{track.number}</span>
        <span className="flex flex-col items-center transition-transform duration-500 ease-out group-hover:scale-[1.03]">
          <span className="font-display text-[clamp(2.1rem,6.5vw,5.5rem)] leading-[0.95]">{track.title}</span>
          <span className="mt-2 text-base text-ink/70">{track.blurb}</span>
          <span className="label mt-1">{meta}</span>
        </span>
        <span
          className={`grid h-10 w-10 place-items-center justify-self-end rounded-full border transition-colors duration-200 ${
            open ? "border-ink bg-ink text-paper" : "border-ink/40 group-hover:border-ink group-hover:bg-ink group-hover:text-paper"
          }`}
        >
          <PlayIcon open={open} />
        </span>
      </button>

      {open && (
        <div id={panelId} ref={panel} className="pb-12">
          <div className={`grid gap-x-6 gap-y-10 ${track.id === "posters" ? "grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))]" : "grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))]"}`}>
            {track.projects.map((p) => (
              <ProjectCard key={p.title} project={p} poster={track.id === "posters"} />
            ))}
          </div>
        </div>
      )}
    </li>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProjectCard({ project, poster }: { project: Project; poster: boolean }) {
  const card = useRef<HTMLDivElement>(null);
  const heart = useRef<HTMLButtonElement>(null);
  const [liked, setLiked] = useState(false);
  const likeKey = `like:${project.title}`;

  useEffect(() => {
    try {
      setLiked(localStorage.getItem(likeKey) === "1");
    } catch {}
  }, [likeKey]);

  // posters tilt in 3D under the pointer
  useGSAP(
    () => {
      if (!poster) return;
      gsap.matchMedia().add(`${MQ.motion} and ${MQ.finePointer}`, () => {
        const el = card.current!;
        const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" });
        const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" });
        const move = (e: PointerEvent) => {
          const b = el.getBoundingClientRect();
          ry(((e.clientX - b.left) / b.width - 0.5) * 18);
          rx(-((e.clientY - b.top) / b.height - 0.5) * 18);
        };
        const leave = () => {
          rx(0);
          ry(0);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      });
    },
    { scope: card }
  );

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    try {
      localStorage.setItem(likeKey, next ? "1" : "0");
    } catch {}
    if (next && !window.matchMedia(MQ.reduced).matches) {
      gsap.fromTo(heart.current, { scale: 0.6 }, { scale: 1, duration: 0.5, ease: "back.out(4)" });
    }
  };

  return (
    <article className="text-center" style={poster ? { perspective: 800 } : undefined}>
      <div
        ref={card}
        className={`relative overflow-hidden rounded-lg bg-line ${poster ? "aspect-[4/5]" : "aspect-[16/10]"}`}
        data-cursor={project.link ? "visit" : undefined}
      >
        {project.link ? (
          <a href={project.link} target="_blank" rel="noreferrer" className="absolute inset-0" aria-label={`visit ${project.title}`}>
            <Cover project={project} />
          </a>
        ) : (
          <Cover project={project} />
        )}
      </div>
      <h3 className="mt-4 text-lg font-medium leading-tight">{project.title}</h3>
      <p className="label mt-1">
        {project.year}, {project.tags.join(", ")}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-base leading-snug text-ink/80">{project.story}</p>
      <button
        ref={heart}
        type="button"
        onClick={toggleLike}
        aria-pressed={liked}
        aria-label={liked ? "unlike" : "like"}
        data-cursor={liked ? "liked" : "like"}
        className={`mt-3 inline-grid h-10 w-10 place-items-center rounded-full transition-colors ${liked ? "text-accent" : "text-ink/40 hover:text-ink"}`}
      >
        <HeartIcon filled={liked} />
      </button>
    </article>
  );
}
