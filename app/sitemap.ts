import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

const routes = ["/", "/publications", "/research", "/writing", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date(),
    changeFrequency: route === "/" ? "monthly" : "weekly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
