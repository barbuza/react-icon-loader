#!/usr/bin/env node

import * as stringify from "javascript-stringify";
import { basename, dirname, join } from "path";
import * as xmlParser from "xml-parser";

import { cleanupOpts } from "./loader";
import { optimize, readFile, visitNode, writeFile } from "./utils";

export async function cli(filename: string) {
  const source = await readFile(filename, "utf-8");
  const optimized = await optimize(source, cleanupOpts);
  const doc: xmlParser.Document = xmlParser(optimized);
  const tsName = join(dirname(filename), `${basename(filename, ".svg")}.icon.ts`);
  const name = basename(filename, ".svg");
  await writeFile(
    tsName,
    `/* tslint:disable */
import { createElement, SFC, SVGAttributes, memo } from 'react';

const reactIcon: SFC<SVGAttributes<SVGSVGElement>> = (props) => ${visitNode(doc.root, true, true)};

if (process.env.NODE_ENV !== 'production') {
  reactIcon.displayName = ${stringify(`react-icon(${name})`)};
}

export default memo(reactIcon);
`,
    "utf-8",
  );
}

if (!module.parent) {
  cli(process.argv[2]).catch(err => {
    /* tslint:disable:no-console */
    console.error(err);
    /* tslint:enable:no-console */
  });
}
