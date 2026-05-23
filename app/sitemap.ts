import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

const routes = ["/", "/publications", "/research", "/writing", "/contact"];

// Use a fixed date to avoid signaling constant content updates to crawlers
const LAST_MODIFIED = new Date("2025-05-23");

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: LAST_MODIFIED,
    changeFrequency: route === "/" ? "monthly" : "weekly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
