import Image from "next/image";
import type { Project } from "@/content/projects";

/** A project's cover image, or a plain slot until the real one is added. */
export default function Cover({ project, sizes = "(min-width: 768px) 33vw, 90vw" }: { project: Project; sizes?: string }) {
  if (project.cover) {
    return <Image src={project.cover} alt={project.title} fill sizes={sizes} className="object-cover" />;
  }

  return (
    <div className="absolute inset-0 grid place-items-center bg-line p-4 text-center">
      <span className="label">TODO: cover for {project.title}</span>
    </div>
  );
}
