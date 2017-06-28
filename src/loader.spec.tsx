import * as glob from "glob";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createContext, Script } from "vm";

import loader from "./loader";
import { optimize, readFile } from "./utils";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;

function callLoader(filename: string, source: string): Promise<string> {
  const cacheable = Math.random() > .5 ? jest.fn() : undefined;
  return new Promise((resolve, reject) => {
    function async() {
      return (err: any, result: string) => {
        if (err) {
          reject(err);
        } else {
          if (cacheable) {
            expect(cacheable.mock.calls).toEqual([[]]);
          }
          resolve(result);
        }
      };
    }
    loader.call({
      async,
      cacheable,
      resourcePath: filename,
    }, source);
  });
}

interface IIconModule {
  exports?: React.SFC<React.SVGAttributes<SVGSVGElement>>;
}

describe("react-icon-loader", () => {
  const svgFiles = glob.sync("node_modules/material-design-icons/action/svg/design/*48px.svg");

  for (const file of svgFiles) {
    test(`loader ${file}`, async () => {
      const source = await readFile(file, "utf-8");
      const js = await callLoader(file, source);

      const script = new Script(js);
      const module: IIconModule = {};
      script.runInContext(createContext({ module, require, process }));
      expect(module.exports).toBeTruthy();

      const Component = module.exports!;

      expect(renderToStaticMarkup(<Component viewBox="spam" />)).toContain("spam");

      const optimized = await optimize(source, loader.cleanupOpts);
      const optimizedComponent = await optimize(renderToStaticMarkup(<Component />), loader.cleanupOpts);
      expect(optimizedComponent).toBe(optimized);
      expect(optimizedComponent).not.toContain("spam");
    });
  }
});
