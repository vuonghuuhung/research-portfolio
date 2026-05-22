import type { Metadata } from "next";
import {
  baseName,
  dateLabelFromFilename,
  getMarkdownCollection,
  normalizePublicPath,
  stripNumericPrefix,
} from "@/lib/content";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Writing",
  description:
    "Technical writing archive on Ethereum, rollups, data availability, peer-to-peer networks, and coded gossip.",
  path: "/writing",
});

function descriptionLines(description?: string) {
  if (!description) {
    return [];
  }

  return description
    .split(/\\n|\n/g)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default async function WritingPage() {
  const entries = await getMarkdownCollection("content/writing");

  return (
    <main className="document writing-page">
      <div className="section-heading">
        <h2>Writing</h2>
      </div>
      <ol className="writing-list">
        {entries.map((entry) => (
          <li className="writing-item" key={entry.path}>
            <div className="writing-main">
              <h3>
                {entry.data.title || stripNumericPrefix(baseName(entry.path))}
              </h3>
              <p className="writing-meta">
                {[
                  dateLabelFromFilename(entry.path) || entry.data.year,
                  entry.data.platform,
                ]
                  .filter(Boolean)
                  .join(" / ")}
              </p>
              {descriptionLines(entry.data.description).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="writing-link">
              {entry.data.link ? (
                <a
                  href={normalizePublicPath(entry.data.link)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Read
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
