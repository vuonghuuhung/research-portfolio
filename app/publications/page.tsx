import type { Metadata } from "next";
import { MarkdownBody } from "@/components/markdown-body";
import {
  baseName,
  getMarkdownCollection,
  normalizePublicPath,
  stripNumericPrefix,
  type MarkdownEntry,
} from "@/lib/content";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Publications",
  description:
    "Publication list for Hung Vuong Huu, including accepted research papers and related artifacts.",
  path: "/publications",
});

function publicationMeta(entry: MarkdownEntry) {
  return [
    entry.data.authors,
    entry.data.venue,
    entry.data.year,
    entry.data.role,
    entry.data.status,
  ]
    .filter(Boolean)
    .join(" / ");
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={normalizePublicPath(href)}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

export default async function PublicationsPage() {
  const publications = await getMarkdownCollection("content/publications");

  return (
    <main className="document">
      <section className="document-section">
        <div className="section-heading">
          <h2>Publications</h2>
        </div>
        <ol className="publication-list">
          {publications.map((entry) => (
            <li className="publication-item" key={entry.path}>
              <article>
                <header className="publication-header">
                  <h3>
                    {entry.data.title ||
                      stripNumericPrefix(baseName(entry.path))}
                  </h3>
                  <p className="publication-meta">{publicationMeta(entry)}</p>
                </header>
                {entry.data.abstract ? (
                  <p className="publication-abstract">{entry.data.abstract}</p>
                ) : null}
                <MarkdownBody entry={entry} />
                <div className="publication-links">
                  {entry.data.paper_link ? (
                    <ExternalLink href={entry.data.paper_link}>
                      Paper
                    </ExternalLink>
                  ) : null}
                  {entry.data.notes ? (
                    <ExternalLink href={entry.data.notes}>Notes</ExternalLink>
                  ) : null}
                  {entry.data.slides ? (
                    <ExternalLink href={entry.data.slides}>Slides</ExternalLink>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
