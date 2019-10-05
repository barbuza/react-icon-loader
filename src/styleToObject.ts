import { Declaration, Node, parse, Rule } from "css";
import { camelCase } from "lodash";

function isRule(node: Node): node is Rule {
  return node.type === "rule";
}

function isDeclaration(node: Node): node is Declaration {
  return node.type === "declaration";
}

export function styleToObject(css: string) {
  const rule = parse(`*{${css}}`)!.stylesheet!.rules[0];
  const style: { [key: string]: string } = {};
  if (isRule(rule)) {
    for (const decl of rule.declarations || []) {
      if (isDeclaration(decl) && decl.property && decl.value) {
        style[camelCase(decl.property)] = decl.value;
      }
    }
  }
  return style;
}
