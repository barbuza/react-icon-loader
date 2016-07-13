import * as fs from 'fs';
import * as path from 'path';
import * as tape from 'tape';
import * as glob from 'glob';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import * as SVGO from 'svgo';
import * as xmlParser from 'xml-parser';
import * as _ from 'lodash';
import loader, { cleanupOpts } from './index';

function fixXmlNode(node: xmlParser.Node): void {
  if (!node.content) {
    node.content = '';
  }
  node.children.forEach(fixXmlNode);
}

function xmlEqual(a: string, b: string): boolean {
  const ta = xmlParser(a);
  const tb = xmlParser(b);

  fixXmlNode(ta.root);
  fixXmlNode(tb.root);

  return _.isEqual(ta, tb);
}

tape('stress', (t: tape.Test) => {
  glob('node_modules/material-design-icons/**/svg/production/*.svg', null, (err, files) => {
    function runNext() {
      if (!files.length) {
        t.end();
        return;
      }
      const filename = files.shift();
      fs.readFile(filename, 'utf-8', (err, source) => {
        const svgo = new SVGO(cleanupOpts);
        svgo.optimize(source, result => {
          function callback(err, js) {
            const comp = eval(js);
            t.equal(comp.displayName, path.basename(filename));
            const reactXml = ReactDOMServer.renderToStaticMarkup(React.createElement(comp));
            t.ok(xmlEqual(reactXml, result.data), filename);
            process.nextTick(runNext);
          }

          loader.call({ resourcePath: filename, async: () => callback }, source);
        });
      });
    }

    runNext();
  });
});
