// Your work, grouped into "tracks". Add real projects here — the tracklist builds itself.
// cover: a path under /public (e.g. "/work/poster-01.webp"). Leave it empty to show a placeholder.

export type TrackId = "web" | "posters" | "brand" | "systems";

export type Project = {
  title: string;
  year: number;
  tags: string[];
  cover?: string;
  link?: string;
  story: string; // one line, in your tone
};

export type Track = {
  id: TrackId;
  number: string;
  title: string;
  blurb: string;
  projects: Project[];
};

export const tracks: Track[] = [
  {
    id: "web",
    number: "01",
    title: "frontend websites",
    blurb: "sites that look good and actually work.",
    projects: [
      // TODO: replace with real projects
      { title: "TODO website one", year: 2025, tags: ["frontend", "design"], story: "TODO — one line about what it was and why it was fun." },
      { title: "TODO website two", year: 2025, tags: ["frontend"], story: "TODO — one line in your voice." },
    ],
  },
  {
    id: "posters",
    number: "02",
    title: "posters",
    blurb: "loud type, big shapes, one idea each.",
    projects: [
      // TODO: replace with real posters
      { title: "TODO poster one", year: 2025, tags: ["poster"], story: "TODO — what was this one for?" },
      { title: "TODO poster two", year: 2025, tags: ["poster", "event"], story: "TODO — one line." },
      { title: "TODO poster three", year: 2024, tags: ["poster"], story: "TODO — one line." },
    ],
  },
  {
    id: "brand",
    number: "03",
    title: "brand identity",
    blurb: "logos, colours, the whole personality.",
    projects: [
      // TODO: replace with real brand work
      { title: "TODO brand one", year: 2025, tags: ["brand", "logo"], story: "TODO — who was it for, what did you make?" },
    ],
  },
  {
    id: "systems",
    number: "04",
    title: "system design",
    blurb: "small diagrams of how things fit together.",
    projects: [
      // TODO: replace with real diagrams
      { title: "TODO system one", year: 2025, tags: ["system design"], story: "TODO — what problem did the diagram solve?" },
    ],
  },
];
