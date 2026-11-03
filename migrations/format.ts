import { at, defineMigration, setIfMissing } from "sanity/migrate";

export default defineMigration({
  title: "Default `format` to markdown and `pdf` to true",
  documentTypes: ["post"],
  filter: "!defined(format) || !defined(pdf)",
  migrate: {
    async document(doc) {
      return [
        // Posts already holding Typst source predate the selector
        at("format", setIfMissing(doc.typst ? "typst" : "markdown")),
        at("pdf", setIfMissing(true)),
      ];
    },
  },
});
