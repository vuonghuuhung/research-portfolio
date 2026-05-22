import Image from "next/image";
import type { Metadata } from "next";
import { MarkdownBody } from "@/components/markdown-body";
import { getMarkdownFile, normalizePublicPath } from "@/lib/content";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About Me",
  description:
    "About Hung Vuong Huu, his blockchain research background, interests, publications, and research attitude.",
  path: "/",
});

export default async function HomePage() {
  const about = await getMarkdownFile("content/about.md");
  console.log(about.data.photo);

  return (
    <main className="document">
      <section className="document-section">
        <div className="section-heading">
          <h2>About Me</h2>
        </div>
        <div className="about-layout">
          <aside className="about-profile">
            <Image
              alt={about.data.name || "Profile photo"}
              className="profile-image"
              height={800}
              priority
              src={normalizePublicPath(
                about.data.photo || "/images/profile.jpeg",
              )}
              width={600}
            />
          </aside>
          <div className="about-content">
            <header className="about-header">
              <h3>{about.data.name || "Hung Vuong Huu"}</h3>
              {about.data.title ? (
                <p className="about-subtitle">{about.data.title}</p>
              ) : null}
            </header>
            <MarkdownBody entry={about} />
          </div>
        </div>
      </section>
    </main>
  );
}
