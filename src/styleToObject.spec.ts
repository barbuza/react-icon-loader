import { styleToObject } from "./styleToObject";

test("styleToObject", () => {
  expect(styleToObject("foo:bar")).toEqual({ foo: "bar" });
  expect(styleToObject("foo:bar;spam:eggs")).toEqual({ foo: "bar", spam: "eggs" });
  expect(styleToObject("foo:bar;s-pam:eggs")).toEqual({ foo: "bar", sPam: "eggs" });
});
