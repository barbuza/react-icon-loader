import * as stringify from "javascript-stringify";
import { getOptions } from "loader-utils";
import * as path from "path";
import { Options } from "svgo";
import * as webpack from "webpack";
import * as xmlParser from "xml-parser";

import { optimize, visitNode } from "./utils";

export const cleanupOpts: Options = {
  plugins: [
    {
      removeAttrs: {
        attrs: ["svg:xmlns", "data-.*"],
      },
    },
    {
      removeDimensions: true,
    },
    {
      removeTitle: true,
    },
    {
      removeRasterImages: true,
    },
  ],
};

export interface ITransform {
  (source: string): void;
  cleanupOpts: Options;
}

function es5Template(tree: xmlParser.Document, displayName: string) {
  return `var createElement = require("react").createElement;
var memo = require("react").memo;
var __assign = require("tslib").__assign;

${tree.root.children.map((child, idx) => `var hoisted${idx} = ${visitNode(child, false, false)};`).join("\n\n")}

function reactIcon(props) {
  return ${visitNode(tree.root, true, false)};
}

if (process.env.NODE_ENV !== 'production') {
  reactIcon.displayName = ${displayName};
}

module.exports = memo(reactIcon);`;
}

function es6Template(tree: xmlParser.Document, displayName: string) {
  return `import { createElement, memo } from "react";
import { __assign } from "tslib";

${tree.root.children.map((child, idx) => `const hoisted${idx} = ${visitNode(child, false, false)};`).join("\n\n")}

function reactIcon(props) {
  return ${visitNode(tree.root, true, false)};
}

if (process.env.NODE_ENV !== 'production') {
  reactIcon.displayName = ${displayName};
}

export default memo(reactIcon);`;
}

const transform = function(this: webpack.loader.LoaderContext, source: string): void {
  if (this.cacheable) {
    this.cacheable();
  }
  const callback = this.async();
  const displayName = stringify(`react-icon(${path.basename(this.resourcePath)})`);

  const options = getOptions(this);
  const useEs6 = !!(options && options.es6);

  optimize(source, cleanupOpts).then(result => {
    const tree: xmlParser.Document = xmlParser(result);
    const tmpl = useEs6 ? es6Template : es5Template;
    const js = tmpl(tree, displayName);
    callback!(null, js);
  });
} as ITransform;

transform.cleanupOpts = cleanupOpts;

export default transform;
