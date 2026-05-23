import type { Metadata } from "next";
import { MarkdownBody } from "@/components/markdown-body";
import {
  getReadingLog,
  markdownTitle,
  type MarkdownEntry,
} from "@/lib/content";
import { pageMetadata, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Research Narrative",
  description:
    "Reading logs and research narrative on data availability sampling, BFT consensus, Ethereum finality, and related protocols.",
  path: "/research",
});

function DetailsBlock({
  children,
  open = false,
  title,
}: {
  children: React.ReactNode;
  open?: boolean;
  title: string;
}) {
  return (
    <details className="details-block" open={open}>
      <summary>{title}</summary>
      <div className="details-body">{children}</div>
    </details>
  );
}

function SectionDetails({ entry }: { entry: MarkdownEntry }) {
  const title = markdownTitle(entry);
  return (
    <DetailsBlock title={title}>
      <h3 className="sr-only">{title}</h3>
      {entry.data.subtitle ? (
        <p className="details-subtitle">{entry.data.subtitle}</p>
      ) : null}
      <MarkdownBody entry={entry} />
    </DetailsBlock>
  );
}

async function ReadingLog({
  folder,
  open = false,
}: {
  folder: string;
  open?: boolean;
}) {
  const log = await getReadingLog(folder);
  const title = markdownTitle(log.indexEntry);

  return (
    <DetailsBlock open={open} title={title}>
      <h2 className="sr-only">{title}</h2>
      {log.indexEntry.data.subtitle ? (
        <p className="log-subtitle">{log.indexEntry.data.subtitle}</p>
      ) : null}
      <MarkdownBody entry={log.indexEntry} />
      <div className="reading-log-sections">
        {log.sections.map((entry) => (
          <SectionDetails entry={entry} key={entry.path} />
        ))}
      </div>
    </DetailsBlock>
  );
}

export default function ResearchPage() {
  const researchPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: "Research Narrative",
    description:
      "Reading logs and research narrative on data availability sampling, BFT consensus, Ethereum finality, and related protocols.",
    author: {
      "@type": "Person",
      name: site.name,
      url: site.url,
    },
    keywords:
      "data availability sampling, DAS, Byzantine fault tolerance, consensus protocols, Ethereum, distributed systems",
    about: [
      {
        "@type": "Thing",
        name: "Data Availability Sampling",
      },
      {
        "@type": "Thing",
        name: "Byzantine Fault Tolerance",
      },
      {
        "@type": "Thing",
        name: "Consensus Protocols",
      },
    ],
  };

  return (
    <main className="document">
      <section className="document-section">
        <div className="section-heading">
          <h1>Research Narrative</h1>
        </div>
        <div className="research-intro">
          <p>
            This section is organized as reading logs rather than as project
            cards. The emphasis is on why a reading path started, what changed
            in my understanding, and what open questions remained after each
            cluster.
          </p>
        </div>
        <div className="reading-log-list">
          <ReadingLog folder="content/research/das-reading-log" open />
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(researchPageJsonLd),
        }}
      />
    </main>
  );
}
