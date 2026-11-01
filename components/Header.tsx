import { site } from "@/content/site";

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[var(--header-bg)] text-ink transition-colors duration-[2500ms]">
      <div className="wrap flex items-center justify-between py-4">
        <a href="#top" className="text-[0.95rem] font-medium" data-cursor="top">
          {site.name}
        </a>
        <nav className="flex gap-5 md:gap-8">
          {site.nav.map((n) => (
            <a key={n.href} href={n.href} className="text-[0.95rem] underline-offset-4 hover:underline">
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
