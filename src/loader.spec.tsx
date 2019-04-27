import * as glob from "glob";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createContext, Script } from "vm";

import loader from "./loader";
import { optimize, readFile } from "./utils";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;

function callLoader(filename: string, source: string, query?: object): Promise<string> {
  const cacheable = Math.random() > 0.5 ? jest.fn() : undefined;
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
    loader.call(
      {
        async,
        cacheable,
        query,
        resourcePath: filename,
      },
      source,
    );
  });
}

interface IIconModule {
  exports?: React.SFC<React.SVGAttributes<SVGSVGElement>>;
}

describe("react-icon-loader", () => {
  const svgFiles = glob.sync("node_modules/material-design-icons/action/svg/design/*48px.svg");

  test("es5 / es6", async () => {
    const source = await readFile(
      "node_modules/material-design-icons/action/svg/design/ic_view_week_48px.svg",
      "utf-8",
    );
    const es5 = await callLoader("test-name", source, { es6: false });
    expect(es5).not.toContain("import { ");
    expect(es5).not.toContain("export default ");
    expect(es5).toContain("require");
    expect(es5).toContain("module.exports");

    const es6 = await callLoader("test-name", source, { es6: true });
    expect(es6).toContain("import { ");
    expect(es6).toContain("export default ");
    expect(es6).not.toContain("require");
    expect(es6).not.toContain("module.exports");
  });

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
