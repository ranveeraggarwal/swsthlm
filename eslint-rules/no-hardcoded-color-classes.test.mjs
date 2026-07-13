import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import rule from './no-hardcoded-color-classes.mjs';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('no-hardcoded-color-classes', rule, {
  valid: [
    // token-driven arbitrary values are the whole point of the design system
    `<div className="bg-[var(--primary)] text-[var(--on-primary)]" />`,
    // arbitrary hex values (brand colors) aren't the named palette
    `<div className="bg-[#4F6FE5] text-white-ish" />`,
    // non-color utilities that happen to contain a color-like substring
    `<div className="-translate-x-0.5 border-2 shadow-[2px_2px_0px_var(--shadow-ink)]" />`,
    // identifiers can't be statically resolved and shouldn't be flagged
    `<div className={\`flex items-center \${brandClassName}\`} />`,
    // non-className attributes are out of scope
    `<div data-color="bg-white" />`,
  ],
  invalid: [
    {
      code: `<div className="bg-white text-black" />`,
      errors: 2,
    },
    {
      code: `<span className={\`font-bold \${isEnded ? "text-zinc-500" : "text-[var(--outline)]"}\`} />`,
      errors: 1,
    },
    {
      code: `<div className={condition && "bg-amber-100"} />`,
      errors: 1,
    },
  ],
});
