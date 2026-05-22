import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SiteNav } from "@/components/site-nav";
import { absoluteUrl, site } from "@/lib/site";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.title,
  authors: [{ name: site.name, url: site.linkedin }],
  creator: site.name,
  publisher: site.name,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: site.title,
    description: site.description,
    url: absoluteUrl("/"),
    siteName: site.title,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: site.title,
    description: site.description,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name: site.name,
      url: site.url,
      email: site.email,
      sameAs: [site.github, site.linkedin],
      knowsAbout: [
        "Data Availability Sampling",
        "Byzantine Fault Tolerance",
        "Consensus Protocols",
        "Distributed Systems",
        "Blockchain Scaling",
      ],
    },
    {
      "@type": "WebSite",
      name: site.title,
      url: site.url,
      description: site.description,
      author: {
        "@type": "Person",
        name: site.name,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
        <div className="site">
          <SiteNav />
          {children}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
