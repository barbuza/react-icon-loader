import { exec as execAsync } from "child_process";
import { readFile as readFileAsync, writeFile as writeFileAsync } from "fs";
import * as stringify from "javascript-stringify";
import * as _ from "lodash";
import * as SVGO from "svgo";
import { promisify } from "util";
import * as xmlParser from "xml-parser";

export const readFile = promisify(readFileAsync) as (path: string, charset: "utf-8") => Promise<string>;
export const writeFile = promisify(writeFileAsync) as (path: string, data: string, charset: "utf-8") => Promise<void>;
export const exec = promisify(execAsync) as (command: string) => Promise<{ stdout: string; stderr: string }>;

export function optimize(source: string, options: object): Promise<string> {
  return new Promise(resolve => {
    const svgo = new SVGO(options);
    svgo.optimize(source, result => {
      setImmediate(() => {
        resolve(result.data);
      });
    });
  });
}

function convertProps(attributes: xmlParser.Attributes): string {
  let props;
  props = _.mapKeys(attributes, (value: string, key: string) => _.camelCase(key));
  if (_.isEmpty(props)) {
    return "undefined";
  }
  return stringify(props);
}

export function visitNode(node: xmlParser.Node, isRoot: boolean, isTs: boolean): string {
  let props = convertProps(node.attributes);

  if (isRoot) {
    if (props === "undefined") {
      props = "props";
    } else if (isTs) {
      props = `{ ...${props}, props }`;
    } else {
      props = `__assign(${props}, props)`;
    }
  }

  let result = `createElement(${stringify(node.name)}${isTs ? " as keyof React.ReactSVG" : ""}, ${props}`;
  if (!_.isEmpty(node.children)) {
    if (isRoot) {
      const children = node.children.map((child, idx) => `hoisted${idx}`).join(", ");
      result = [result, children].join(", ");
    } else {
      const children = node.children.map(child => visitNode(child, false, isTs)).join(", ");
      result = [result, children].join(", ");
    }
  }
  if (!_.isEmpty(node.content)) {
    result = [result, stringify(node.content)].join(", ");
  }
  result += ")";
  return result;
}
