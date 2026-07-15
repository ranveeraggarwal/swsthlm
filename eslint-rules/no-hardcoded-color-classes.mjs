// Flags raw Tailwind palette color classes (bg-white, text-zinc-500, ...) in
// className. This codebase themes exclusively through the CSS custom
// properties in src/app/globals.css (e.g. `bg-[var(--primary)]`); a raw
// palette class works by accident in light mode and silently breaks in dark
// mode, since it never resolves to the theme's dark-mode value. See
// docs/DESIGN.md, "Rules future changes must follow."
//
// Only literal/template string content in `className` is checked, so
// `bg-[var(--primary)]` and `bg-[#4F6FE5]` (arbitrary values) are unaffected
// — this rule targets the named palette, not arbitrary-value syntax.

const COLOR_WORDS = [
  "white",
  "black",
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

const UTILITY_PREFIXES = [
  "text",
  "bg",
  "border",
  "ring",
  "fill",
  "stroke",
  "from",
  "via",
  "to",
  "divide",
  "outline",
  "decoration",
  "caret",
  "accent",
  "shadow",
];

const VARIANT_PREFIX = /^(?:[a-z-]+:)*/;

const CLASS_TOKEN = new RegExp(
  `^(?:${VARIANT_PREFIX.source})(?:${UTILITY_PREFIXES.join("|")})-(?:${COLOR_WORDS.join("|")})(?:-[0-9]{2,3})?$`
);

function checkString(context, node, text) {
  for (const token of text.split(/\s+/)) {
    if (CLASS_TOKEN.test(token)) {
      context.report({
        node,
        message: `"${token}" is a raw Tailwind palette class. Use a design-system token instead (e.g. text-[var(--on-primary)]) — see docs/DESIGN.md.`,
      });
    }
  }
}

/** Collect every string literal / template chunk inside a className value. */
function collectStrings(node, out) {
  if (!node) return;
  switch (node.type) {
    case "Literal":
      if (typeof node.value === "string") out.push([node, node.value]);
      break;
    case "TemplateLiteral":
      for (const quasi of node.quasis) out.push([quasi, quasi.value.raw]);
      for (const expr of node.expressions) collectStrings(expr, out);
      break;
    case "ConditionalExpression":
      collectStrings(node.consequent, out);
      collectStrings(node.alternate, out);
      break;
    case "LogicalExpression":
      collectStrings(node.left, out);
      collectStrings(node.right, out);
      break;
    case "JSXExpressionContainer":
      collectStrings(node.expression, out);
      break;
    default:
      break;
  }
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow raw Tailwind palette color classes; require design-system tokens",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name !== "className") return;
        const strings = [];
        collectStrings(node.value, strings);
        for (const [target, text] of strings) {
          checkString(context, target, text);
        }
      },
    };
  },
};

export default rule;
