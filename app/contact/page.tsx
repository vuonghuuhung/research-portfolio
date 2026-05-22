import type { Metadata } from "next";
import { MarkdownBody } from "@/components/markdown-body";
import { getMarkdownFile } from "@/lib/content";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Contact information for discussing research, reading paths, and open questions.",
  path: "/contact",
});

export default async function ContactPage() {
  const contact = await getMarkdownFile("content/contact.md");

  return (
    <main className="document">
      <section className="document-section">
        <div className="section-heading">
          <h2>Contact</h2>
        </div>
        <MarkdownBody entry={contact} />
      </section>
    </main>
  );
}
