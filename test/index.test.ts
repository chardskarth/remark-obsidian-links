import { compile } from "mdsvex";
import { readSync } from "to-vfile";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import minifyWhitespace from "rehype-minify-whitespace";

import { test, expect } from "vitest";

import convertObsidianLinks from "../src";
import { ObsidianLinkOptions } from "../src/types";

async function assert(fixture: string, options?: ObsidianLinkOptions) {
  /* input */
  const inputStr = readSync(`./test/fixtures/${fixture}/input.md`).toString();
  const mdsvexOptions = {
    remarkPlugins: [[convertObsidianLinks, options]],
    rehypePlugins: [minifyWhitespace],
  };

  const input: string = (await compile(inputStr, mdsvexOptions))?.code.trim();

  /* output */
  const outputStr = readSync(
    `./test/fixtures/${fixture}/output.html`
  ).toString();
  const output: string = unified()
    .use(rehypeParse, { fragment: true })
    .use(minifyWhitespace)
    .use(rehypeStringify)
    .processSync(outputStr)
    .toString()
    .trim();
  /* test */
  test("test", () => expect(input).toBe(output));
}

assert("basic");
assert("option-link-prefix", {
  linkPrefix: ["src", ""],
});
