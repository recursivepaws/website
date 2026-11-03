import {
  NodeCompiler,
  type NodeError,
} from "@myriaddreamin/typst-ts-node-compiler";
import { stegaClean } from "@sanity/client/stega";
import type { Post } from "./sanity";

// Fixed virtual root so uploaded files resolve the same everywhere
const ROOT = "/typst";
const compiler = NodeCompiler.create({ workspace: ROOT });

// shortcut: bundled Typst is 0.14 (no MathML), so math renders as inline SVG. Drop once typst.ts ships 0.15+.
// box() keeps inline math inside its paragraph instead of splitting it
const HTML_PREAMBLE =
  "#show math.equation: it => if it.block { html.frame(it) } else { box(html.frame(it)) }\n";

export class TypstError extends Error {}

// Visual editing hides stega characters in strings, which would corrupt source and filenames
async function load(dirty: Post) {
  const post = stegaClean(dirty);
  // Fetch everything before touching shadow state, so the compile below stays synchronous
  const files = await Promise.all(
    (post.typstFiles ?? []).map(async ({ name, url }) => {
      const res = await fetch(url);
      if (!res.ok) throw new TypstError(`Fetching ${name}: ${res.status}`);
      return [name, Buffer.from(await res.arrayBuffer())] as const;
    }),
  );
  compiler.resetShadow();
  for (const [name, data] of files) compiler.mapShadow(`${ROOT}/${name}`, data);
  return post.typst ?? "";
}

function fail(err: NodeError | null): never {
  const lines = err
    ? compiler.fetchDiagnostics(err).map((d) => d.message)
    : ["unknown error"];
  throw new TypstError(lines.join("\n"));
}

export async function typstHtml(post: Post): Promise<string> {
  const source = await load(post);
  const out = compiler.tryHtml({
    mainFileContent: HTML_PREAMBLE + source,
    inputs: { target: "html" },
  });
  if (out.hasError() || !out.result) fail(out.takeDiagnostics());
  return out.result.body();
}

export async function typstPdf(post: Post): Promise<Buffer> {
  const source = await load(post);
  const out = compiler.compile({
    mainFileContent: source,
    inputs: { target: "pdf" },
  });
  if (out.hasError() || !out.result) fail(out.takeDiagnostics());
  return compiler.pdf(out.result);
}
