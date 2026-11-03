import type { APIRoute } from "astro";
import { stegaClean } from "@sanity/client/stega";
import { getPost } from "../../utils/sanity";
import { TypstError, typstPdf } from "../../utils/typst";

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug ?? "";
  const post = await getPost(slug).catch(() => null);
  if (!post || stegaClean(post.format) !== "typst" || post.pdf === false)
    return new Response(null, { status: 404 });

  try {
    const pdf = await typstPdf(post);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${slug}.pdf"`,
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (e) {
    if (!(e instanceof TypstError)) throw e;
    return new Response(e.message, { status: 500 });
  }
};
