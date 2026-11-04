import { defineField, type FieldDefinition } from "sanity";
import { TypstInput } from "../components/typstInput";

export enum Common {
  title = "title",
  date = "date",
  slug = "slug",
  photo = "photo",
  gallery = "gallery",
  icon = "icon",
  links = "links",
  nsfw = "nsfw",
  featured = "featured",
  format = "format",
  body = "body",
  typst = "typst",
  typstFiles = "typstFiles",
  pdf = "pdf",
  preview = "preview",
  tags = "tags",
}

export const common: Record<Common, FieldDefinition> = {
  title: defineField({
    name: "title",
    title: "Title",
    type: "string",
  }),
  date: defineField({
    name: "date",
    title: "Date",
    type: "date",
    validation: (rule) => rule.required(),
  }),
  slug: defineField({
    name: "slug",
    title: "Slug",
    type: "slug",
    validation: (rule) => rule.required(),
    options: {
      source: "title",
      maxLength: 96,
    },
  }),
  nsfw: defineField({
    name: "nsfw",
    title: "NSFW",
    type: "boolean",
    options: { layout: "checkbox" },
    validation: (rule) => rule.required(),
  }),
  featured: defineField({
    name: "featured",
    title: "Highlight on home page",
    type: "boolean",
    options: { layout: "checkbox" },
  }),
  photo: defineField({
    name: "photo",
    title: "Photo",
    type: "captionedImage",
  }),
  gallery: defineField({
    name: "gallery",
    title: "Gallery",
    type: "gallery",
  }),
  icon: defineField({
    type: "icon.manager",
    name: "icon",
    title: "Icon",
  }),
  links: defineField({
    name: "links",
    title: "Links",
    type: "array",
    of: [{ type: "url" }],
  }),
  format: defineField({
    name: "format",
    title: "Format",
    type: "string",
    options: {
      list: [
        { title: "Markdown", value: "markdown" },
        { title: "Typst", value: "typst" },
      ],
      layout: "radio",
      direction: "horizontal",
    },
    initialValue: "markdown",
  }),
  body: defineField({
    name: "body",
    title: "Body",
    type: "markdown",
    hidden: ({ document }) => document?.format === "typst",
  }),
  typst: defineField({
    name: "typst",
    title: "Typst",
    type: "text",
    components: { input: TypstInput },
    description: 'Typst source. sys.inputs.target is "html" or "pdf".',
    hidden: ({ document }) => document?.format !== "typst",
  }),
  typstFiles: defineField({
    name: "typstFiles",
    title: "Typst files",
    type: "array",
    of: [{ type: "file" }],
    description:
      'Images, .typ or .bib files, referenced by upload filename, e.g. #image("fig.png").',
    hidden: ({ document }) => document?.format !== "typst",
  }),
  pdf: defineField({
    name: "pdf",
    title: "Offer PDF download",
    type: "boolean",
    options: { layout: "checkbox" },
    hidden: ({ document }) => document?.format !== "typst",
    initialValue: true,
  }),
  preview: defineField({
    name: "preview",
    title: "Preview",
    type: "reference",
    validation: (rule) => rule.required(),
    to: [{ type: "captionedImage" }],
  }),
  tags: defineField({
    name: "tags",
    title: "Tags",
    type: "array",
    of: [
      {
        type: "reference",
        to: [{ type: "category" }],
      },
    ],
    validation: (rule) => rule.required(),
  }),
};

export function mapDefinition(
  value: Common | FieldDefinition,
): FieldDefinition {
  return typeof value === "string" ? common[value] : value;
}
