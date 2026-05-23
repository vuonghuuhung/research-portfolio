import type { Metadata } from "next";

export const site = {
  name: "Hans Vuong",
  title: "Hans Vuong — Research Portfolio",
  description:
    "Research portfolio covering data availability sampling, Byzantine fault tolerance, consensus protocols, publications, and technical writing.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL || "https://research-portfolio.vercel.app",
  email: "hans.vuong182@gmail.com",
  github: "https://github.com/vuonghuuhung",
  linkedin: "https://www.linkedin.com/in/hansvuong182",
};

export const navItems = [
  { href: "/", label: "About Me" },
  { href: "/publications", label: "Publications" },
  { href: "/research", label: "Research Narrative" },
  { href: "/writing", label: "Writing" },
  { href: "/contact", label: "Contact" },
];

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(path);
  const pageTitle = title.endsWith(" | Hans") ? title : `${title} | Hans`;

  return {
    title: {
      absolute: pageTitle,
    },
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: site.title,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: pageTitle,
      description,
    },
  };
}
