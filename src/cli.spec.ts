import * as glob from "glob";

import { cli } from "./cli";
import { exec } from "./utils";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;

describe("react-icon-loader", async () => {
  const svgFiles = glob.sync("node_modules/material-design-icons/action/svg/design/*48px.svg");

  for (const file of svgFiles) {
    test(`cli ${file}`, async () => {
      await cli(file);
    });
  }

  test("compile", async () => {
    const tsRes = await exec(`./node_modules/.bin/tsc node_modules/material-design-icons/action/svg/design/*.ts`);
    expect(tsRes.stderr).toHaveLength(0);
  });

  test("exec", async () => {
    for (const file of glob.sync("node_modules/material-design-icons/action/svg/design/*.js")) {
      const nodeRes = await exec(`node ${file}`);
      expect(nodeRes.stderr).toHaveLength(0);
    }
  });
});
