import { createHash } from "node:crypto";
import {
  NodeCompiler,
  type NodeError,
} from "@myriaddreamin/typst-ts-node-compiler";
import { stegaClean } from "@sanity/client/stega";
import type { Post } from "./sanity";

// Fixed virtual root so uploaded files resolve the same everywhere
const ROOT = "/typst";
const compiler = NodeCompiler.create({ workspace: ROOT });

export class TypstError extends Error {}

const sha1 = (data: Buffer) => createHash("sha1").update(data).digest("hex");

// Visual editing hides stega characters in strings, which would corrupt source and filenames
async function load(dirty: Post) {
  const post = stegaClean(dirty);
  // Fetch everything before touching shadow state, so the compile below stays synchronous
  const files = await Promise.all(
    (post.typstFiles ?? []).map(async ({ name, url }) => {
      const res = await fetch(url);
      if (!res.ok) throw new TypstError(`Fetching ${name}: ${res.status}`);
      return { name, url, data: Buffer.from(await res.arrayBuffer()) };
    }),
  );
  compiler.resetShadow();
  for (const { name, data } of files) compiler.mapShadow(`${ROOT}/${name}`, data);
  const urls = new Map(files.map(({ url, data }) => [sha1(data), url]));
  return { source: post.typst ?? "", urls };
}

function fail(err: NodeError | null): never {
  const lines = err
    ? compiler.fetchDiagnostics(err).map((d) => d.message)
    : ["unknown error"];
  throw new TypstError(lines.join("\n"));
}

export async function typstHtml(post: Post): Promise<string> {
  const { source, urls } = await load(post);
  const out = compiler.tryHtml({
    mainFileContent: source,
    inputs: { target: "html" },
  });
  if (out.hasError() || !out.result) fail(out.takeDiagnostics());
  // Typst inlines images as data URIs; point uploaded ones back at the CDN instead
  return out.result
    .body()
    .replace(/src="data:[^;"]+;base64,([^"]+)"/g, (match, b64: string) => {
      const url = urls.get(sha1(Buffer.from(b64, "base64")));
      return url ? `src="${url}" loading="lazy"` : match;
    });
}

export async function typstPdf(post: Post): Promise<Buffer> {
  const { source } = await load(post);
  const out = compiler.compile({
    mainFileContent: source,
    inputs: { target: "pdf" },
  });
  if (out.hasError() || !out.result) fail(out.takeDiagnostics());
  return compiler.pdf(out.result);
}
