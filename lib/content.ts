import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export type Frontmatter = {
  abstract?: string;
  authors?: string;
  cv?: string;
  cv_label?: string;
  description?: string;
  diagram?: string;
  email?: string;
  github?: string;
  github_label?: string;
  linkedin?: string;
  linkedin_label?: string;
  link?: string;
  name?: string;
  notes?: string;
  order?: number;
  paper_link?: string;
  photo?: string;
  platform?: string;
  role?: string;
  slides?: string;
  status?: string;
  subtitle?: string;
  title?: string;
  venue?: string;
  year?: number;
};

export type MarkdownEntry = {
  body: string;
  data: Frontmatter;
  filename: string;
  path: string;
};

const contentRoot = path.join(process.cwd(), "content");
const publicPathPrefixes = ["assets/", "papers/", "demos/", "content/diagrams/"];

function contentRelativePath(relativePath: string) {
  return relativePath.replace(/^content\//, "");
}

function entryPathFromFile(filePath: string) {
  return `content/${path.relative(contentRoot, filePath)}`;
}

export function normalizePublicPath(value = "") {
  if (
    !value ||
    value.startsWith("/") ||
    value.startsWith("#") ||
    /^[a-z][a-z0-9+.-]*:/i.test(value)
  ) {
    return value;
  }

  if (publicPathPrefixes.some((prefix) => value.startsWith(prefix))) {
    return `/${value}`;
  }

  return value;
}

export function baseName(filePath: string) {
  const file = filePath.split("/").pop() || filePath;
  return file.replace(/\.md$/i, "");
}

export function stripNumericPrefix(value: string) {
  return value.replace(/^\d+-/, "");
}

function filenameSortKey(filePath: string) {
  return stripNumericPrefix(baseName(filePath)).toLowerCase();
}

function leadingNumericPrefix(filePath: string) {
  const match = baseName(filePath).match(/^(\d+)-/);
  return match ? Number(match[1]) : null;
}

function datedFilenameValue(filePath: string) {
  const match = baseName(filePath).match(/^(\d{2})-(\d{2})-(\d{4})-/);
  if (!match) {
    return null;
  }

  const [, month, day, year] = match;
  return Number(`${year}${month}${day}`);
}

export function dateLabelFromFilename(filePath: string) {
  const match = baseName(filePath).match(/^(\d{2})-(\d{2})-(\d{4})-/);
  if (!match) {
    return null;
  }

  const [, month, day, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function sortByFilename(entries: MarkdownEntry[]) {
  return [...entries].sort((a, b) => {
    const aDate = datedFilenameValue(a.path);
    const bDate = datedFilenameValue(b.path);

    if (aDate !== null || bDate !== null) {
      return (bDate || 0) - (aDate || 0);
    }

    const aPrefix = leadingNumericPrefix(a.path);
    const bPrefix = leadingNumericPrefix(b.path);

    if (aPrefix !== null || bPrefix !== null) {
      if (aPrefix === null) return 1;
      if (bPrefix === null) return -1;
      if (aPrefix !== bPrefix) return aPrefix - bPrefix;
    }

    return filenameSortKey(a.path).localeCompare(filenameSortKey(b.path));
  });
}

function normalizeMarkdownLinks(markdown: string) {
  return markdown
    .replace(
      /(\]\()((?:assets|papers|demos|content\/diagrams)\/[^)\s]+)/g,
      "$1/$2"
    )
    .replace(
      /(<(?:img|iframe)\b[^>]*(?:src)=["'])((?:assets|papers|demos|content\/diagrams)\/[^"']+)/g,
      "$1/$2"
    );
}

async function readMarkdownFile(relativePath: string): Promise<MarkdownEntry> {
  const contentPath = contentRelativePath(relativePath);
  const filePath = path.join(contentRoot, contentPath);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);

  return {
    body: parsed.content,
    data: parsed.data as Frontmatter,
    filename: path.basename(relativePath),
    path: relativePath,
  };
}

async function walkMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const resolved = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walkMarkdownFiles(resolved);
      }
      return entry.isFile() && entry.name.endsWith(".md") ? [resolved] : [];
    })
  );

  return files.flat();
}

export function markdownTitle(entry: MarkdownEntry) {
  return (
    entry.data.title || stripNumericPrefix(baseName(entry.path)).replace(/-/g, " ")
  );
}

export async function getMarkdownFile(relativePath: string) {
  return readMarkdownFile(relativePath);
}

export async function getMarkdownCollection(folder: string) {
  const folderPath = path.join(contentRoot, contentRelativePath(folder));
  const files = await walkMarkdownFiles(folderPath);
  const entries = await Promise.all(files.map((file) => readMarkdownFile(entryPathFromFile(file))));

  return sortByFilename(entries);
}

export async function getReadingLog(folder: string) {
  const [indexEntry, sections] = await Promise.all([
    getMarkdownFile(`${folder}/index.md`),
    getMarkdownCollection(`${folder}/sections`),
  ]);

  return {
    indexEntry,
    sections,
  };
}

export async function markdownToHtml(markdown: string) {
  const normalized = normalizeMarkdownLinks(markdown);
  return marked.parse(normalized, {
    async: false,
    gfm: true,
  }) as string;
}

export async function getAllContentEntries() {
  const files = await walkMarkdownFiles(contentRoot);
  return Promise.all(files.map((file) => readMarkdownFile(entryPathFromFile(file))));
}
