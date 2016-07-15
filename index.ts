import * as path from 'path';
import * as _ from 'lodash';
import * as xmlParser from 'xml-parser';
import * as SVGO from 'svgo';

const cleanupOpts = {
  plugins: [
    {
      removeAttrs: {
        attrs: [
          'svg:xmlns',
          'data-.*'
        ]
      }
    },
    {
      removeDimensions: true
    },
    {
      removeTitle: true
    },
    {
      removeRasterImages: true
    }
  ]
};

function convertProps(attributes: xmlParser.Attributes): string {
  const props = _.mapKeys(attributes, (value: string, key: string) => _.camelCase(key));
  if (_.isEmpty(props)) {
    return 'null';
  }
  return JSON.stringify(props);
}

function visitNode(node: xmlParser.Node, isRoot: boolean): string {
  let props = convertProps(node.attributes);
  if (isRoot) {
    if (props === 'null') {
      props = 'props';
    } else {
      props = `assign({}, ${props}, props)`;
    }
  }
  let result = `createElement(${JSON.stringify(node.name)}, ${props}`;
  if (!_.isEmpty(node.children)) {
    const children = node.children.map(child => visitNode(child, false)).join(', ');
    result = [result, children].join(', ');
  }
  if (!_.isEmpty(node.content)) {
    result = [result, JSON.stringify(node.content)].join(', ');
  }
  result += ')';
  return result;
}

interface ITransform {
  (source: string): void;
  cleanupOpts: typeof cleanupOpts;
}

const transform = function (source: string): void {
  if (this.cacheable) {
    this.cacheable();
  }
  const callback = this.async();
  const svgo = new SVGO(cleanupOpts);
  const displayName = JSON.stringify(`react-icon(${path.basename(this.resourcePath)})`);
  svgo.optimize(source, result => {
    const tree: xmlParser.Document = xmlParser(result.data);
    const js = [
      'var createElement = require("react").createElement;',
      'var assign = require("object-assign");',
      'function reactIcon(props) {',
      `  return ${visitNode(tree.root, true)};`,
      '}'
    ];
    if (process.env.NODE_ENV !== 'production') {
      js.push(`reactIcon.displayName = ${displayName};`);
    }
    js.push('module.exports = reactIcon;');
    callback(null, js.join('\n'));
  });
} as ITransform;

transform.cleanupOpts = cleanupOpts;

export = transform;
