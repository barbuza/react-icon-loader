import * as stringify from "javascript-stringify";
import * as path from "path";
import * as webpack from "webpack";
import * as xmlParser from "xml-parser";

import { optimize, visitNode } from "./utils";

export const cleanupOpts = {
  plugins: [
    {
      removeAttrs: {
        attrs: [
          "svg:xmlns",
          "data-.*",
        ],
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
  cleanupOpts: typeof cleanupOpts;
}

const transform = function(this: webpack.loader.LoaderContext, source: string): void {
  if (this.cacheable) {
    this.cacheable();
  }
  const callback = this.async();
  const displayName = stringify(`react-icon(${path.basename(this.resourcePath)})`);

  optimize(source, cleanupOpts).then((result) => {
    const tree: xmlParser.Document = xmlParser(result);
    const js = `var createElement = require('react').createElement;
var assign = require('object-assign');

function reactIcon(props) {
  return ${visitNode(tree.root, true, false)};
}

if (process.env.NODE_ENV !== 'production') {
  reactIcon.displayName = ${displayName};
}

module.exports = reactIcon;
`;
    callback!(null, js);
  });
} as ITransform;

transform.cleanupOpts = cleanupOpts;

export default transform;
