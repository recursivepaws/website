import { defineType } from "sanity";
import { mediaPreview } from "sanity-plugin-icon-manager";
import { common } from "../fields";

/**
 * Post schema.  Define and edit the fields for the 'post' content type.
 * Learn more: https://www.sanity.io/docs/schema-types
 */

// everything should be a post
export default defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    common.title,
    common.slug,
    common.nsfw,
    common.featured,
    common.tags,
    common.links,
    common.icon,
    common.date,
    common.gallery,
    common.format,
    common.body,
    common.typst,
    common.typstFiles,
    common.pdf,
  ],
  preview: {
    select: {
      title: "title",
      icon: "icon",
    },
    prepare({ icon, title }) {
      return {
        title: title,
        media: mediaPreview(icon),
      };
    },
  },
  initialValue: {
    nsfw: false,
    featured: false,
  },
});
