import {
  defaultHighlightStyle,
  HighlightStyle,
  LanguageSupport,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import {
  TypstHighlightSytle,
  typst_lezer,
  typstLezerFoldService,
  typstLezerIndentService,
  typstLezerLinter,
  typstLezerListKeymap,
  typstTags,
} from "codemirror-lang-typst/lezer";
import { useCallback } from "react";
import {
  type StringInputProps,
  set,
  unset,
  useColorSchemeValue,
} from "sanity";

// typst_lezer() bundles light-only colors, so rebuild its support with a dark variant
const { language } = typst_lezer();
const support = [
  typstLezerIndentService,
  typstLezerListKeymap,
  typstLezerFoldService,
  typstLezerLinter,
];

// Same roles as TypstHighlightSytle, lifted for contrast on a dark background
const darkHighlight = HighlightStyle.define([
  { tag: tags.comment, color: "#8b8f98" },
  { tag: tags.monospace, color: "#a9adb5" },
  { tag: typstTags.mathDelimiter, color: "#7fd36e" },
  { tag: typstTags.listMarker, color: "#c79cf2" },
  { tag: tags.escape, color: "#5fc7d1" },
  { tag: tags.labelName, color: "#5fc7d1" },
  { tag: [tags.keyword, tags.null, tags.atom, tags.bool], color: "#ff7b86" },
  { tag: tags.number, color: "#f27db4" },
  { tag: tags.string, color: "#98c379" },
  { tag: tags.function(tags.variableName), color: "#7aa2f7" },
  { tag: [typstTags.interpolated, tags.propertyName], color: "#c79cf2" },
  { tag: tags.heading, fontWeight: "bold", textDecoration: "underline" },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
]);

const lightExtensions = [
  new LanguageSupport(language, [
    ...support,
    syntaxHighlighting(TypstHighlightSytle),
    syntaxHighlighting(defaultHighlightStyle),
  ]),
  EditorView.lineWrapping,
];
const darkExtensions = [
  new LanguageSupport(language, [...support, syntaxHighlighting(darkHighlight)]),
  EditorView.lineWrapping,
  EditorView.theme({ ".cm-scroller": { colorScheme: "dark" } }, { dark: true }),
];

export function TypstInput(props: StringInputProps) {
  const { value, onChange, readOnly, elementProps } = props;
  const dark = useColorSchemeValue() === "dark";

  const handleChange = useCallback(
    (next: string) => onChange(next ? set(next) : unset()),
    [onChange],
  );

  return (
    <CodeMirror
      id={elementProps.id}
      value={value ?? ""}
      onChange={handleChange}
      onFocus={elementProps.onFocus}
      onBlur={elementProps.onBlur}
      readOnly={readOnly}
      theme={dark ? "dark" : "light"}
      extensions={dark ? darkExtensions : lightExtensions}
      // long sources (the astrology article is ~47 KB) scroll inside the editor
      minHeight="20rem"
      maxHeight="75vh"
      basicSetup={{ highlightActiveLine: false }}
    />
  );
}
