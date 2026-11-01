// All the words on the site live here. Edit freely — no components to touch.
// Anything marked TODO is a placeholder waiting for the real thing.

export const site = {
  name: "simonfolio",
  owner: "Ayush Simon Barwa",
  title: "simonfolio — designs things, builds them, djs sometimes",
  description:
    "college student. freelance frontend websites, posters, brand identity and a bit of system design. djs for fun.",

  nav: [
    { label: "tracks", href: "#tracks" },
    { label: "b-side", href: "#b-side" },
    { label: "contact", href: "#contact" },
  ],

  preloader: { bpm: 128, label: "bpm" },

  // The background follows the time of day and the live weather here.
  // Preview any look with ?sky=dawn|day|dusk|night and ?weather=clear|clouds|fog|drizzle|rain|storm|snow
  sky: {
    city: "bhubaneswar",
    latitude: 20.2961,
    longitude: 85.8245,
    timezone: "Asia/Kolkata",
    utcOffsetMin: 330,
  },

  hero: {
    hello: "hey, i'm",
    line: "i design things for the web, then build them. sometimes i dj.",
    action: { label: "say hi", href: "#contact" },
    secondary: { label: "see the tracklist", href: "#tracks" },
  },

  story: {
    phrases: ["i design things", "and then i build them", "so they look good", "and actually work."],
    question: "okay so… what have i made?",
  },

  tracks: {
    heading: "tracklist",
    hint: "the set so far. tap a track to open it.",
  },

  bside: {
    heading: "the dj",
    lines: [
      "off the clock (well, out of class), i dj.",
      "same brain as design honestly — reading the room, building up, knowing when to drop.",
    ],
    // TODO: paste a SoundCloud / Mixcloud *embed* URL, e.g.
    // "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/you/your-mix"
    mixEmbedUrl: "",
    vinylHint: "scroll faster and the record spins faster.",
  },

  pillars: {
    heading: "how i work",
    items: [
      {
        title: "space is a feeling",
        body: "most of design is deciding what to leave out. drag it and feel the difference.",
      },
      {
        title: "one colour, on purpose",
        body: "pick one accent and make it mean something. go on, pick one.",
      },
      {
        title: "the little stuff",
        body: "the details you only find if you poke around. like this one.",
      },
    ],
  },

  contact: {
    heading: "if this vibed, let's talk.",
    sub: "freelance websites, posters, brand stuff. or just say hi.",
    email: "TODO@example.com", // TODO: your real email
    copied: "copied. talk soon.",
    socials: [
      // TODO: real profile links
      { label: "instagram", href: "#TODO" },
      { label: "github", href: "#TODO" },
      { label: "linkedin", href: "#TODO" },
      { label: "soundcloud", href: "#TODO" },
    ],
    footer: "thanks for listening.",
    copyHint: "tap to copy it, or",
    mailApp: "open your mail app",
  },
} as const;
