import Image from "next/image";
import {
  markdownToHtml,
  normalizePublicPath,
  type MarkdownEntry,
} from "@/lib/content";

export async function MarkdownBody({
  className = "markdown-body",
  entry,
}: {
  className?: string;
  entry: MarkdownEntry;
}) {
  const html = await markdownToHtml(entry.body);

  return (
    <div className={className}>
      {entry.data.diagram ? (
        <figure className="diagram-block">
          <Image
            alt={entry.data.title || "Diagram"}
            height={540}
            src={normalizePublicPath(entry.data.diagram)}
            width={960}
          />
        </figure>
      ) : null}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
