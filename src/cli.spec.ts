import * as glob from "glob";

import { cli } from "./cli";
import { exec } from "./utils";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;

describe("react-icon-loader", () => {
  const svgFiles = glob.sync("node_modules/material-design-icons/action/svg/design/*48px.svg");

  for (const file of svgFiles) {
    test(`cli ${file}`, async () => {
      await cli(file);
    });
  }

  test("compile", async () => {
    const tsFiles = glob.sync("node_modules/material-design-icons/action/svg/design/*.ts");
    expect(tsFiles).toHaveLength(svgFiles.length);
    const tsRes = await exec(`./node_modules/.bin/tsc ${tsFiles.join(" ")}`);
    expect(tsRes.stderr).toHaveLength(0);
  });

  test("exec", async () => {
    const jsFiles = glob.sync("node_modules/material-design-icons/action/svg/design/*.js");
    expect(jsFiles).toHaveLength(svgFiles.length);
    for (const file of jsFiles) {
      const nodeRes = await exec(`node ${file}`);
      expect(nodeRes.stderr).toHaveLength(0);
    }
  });
});
