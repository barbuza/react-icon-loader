import * as fs from 'fs';
import * as path from 'path';
import * as tape from 'tape';
import * as glob from 'glob';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import * as SVGO from 'svgo';
import * as xmlParser from 'xml-parser';
import * as _ from 'lodash';
import * as async from 'async';
import * as renderPreact from 'preact-render-to-string';
import * as preact from 'preact';
import loader = require('./index');

function fixXmlNode(node: xmlParser.Node): void {
  if (node.hasOwnProperty('content') && _.isEmpty(node.content)) {
    delete node.content;
  }
  node.children.forEach(fixXmlNode);
}

function xmlEqual(a: string, b: string): boolean {
  const ta = xmlParser(a).root;
  const tb = xmlParser(b).root;

  fixXmlNode(ta);
  fixXmlNode(tb);

  return _.isEqual(ta, tb);
}

tape('preact', t => {
  const testFile = async.compose(
    (filename, optimized, js, callback) => {
      const comp = eval(js);
      t.equal(comp.displayName, `preact-icon(${path.basename(filename)})`, `displayName ${path.basename(filename)}`);
      const preactXml = renderPreact(preact.h(comp));
      t.ok(xmlEqual(preactXml, optimized), `render ${path.basename(filename)}`);
      callback();
    },

    (filename, source, optimized, callback) => {
      loader.call({
        resourcePath: filename,
        async: () => (err, js) => callback(err, filename, optimized, js),
        query: '?preact'
      }, source);
    },

    (filename, source, callback) => {
      const svgo = new SVGO(loader.cleanupOpts);
      svgo.optimize(source, result => callback(null, filename, source, result.data));
    },

    (filename, callback) => {
      fs.readFile(filename, 'utf-8', (err, source) => callback(err, filename, source));
    }
  ) as AsyncIterator<string>;

  glob('test-icons/*.svg', null, (err, files) => {
    async.eachSeries(files, testFile, err => {
      if (err) {
        t.end(err);
      } else {
        glob('node_modules/material-design-icons/**/svg/production/*.svg', null, (err, files) => {
          async.eachSeries(files, testFile, t.end);
        });
      }
    });
  });

});

tape('react', t => {
  const testFile = async.compose(
    (filename, optimized, js, callback) => {
      const comp = eval(js);
      t.equal(comp.displayName, `react-icon(${path.basename(filename)})`, `displayName ${path.basename(filename)}`);
      const reactXml = ReactDOMServer.renderToStaticMarkup(React.createElement(comp));
      t.ok(xmlEqual(reactXml, optimized), `render ${path.basename(filename)}`);
      callback();
    },

    (filename, source, optimized, callback) => {
      loader.call({
        resourcePath: filename,
        async: () => (err, js) => callback(err, filename, optimized, js)
      }, source);
    },

    (filename, source, callback) => {
      const svgo = new SVGO(loader.cleanupOpts);
      svgo.optimize(source, result => callback(null, filename, source, result.data));
    },

    (filename, callback) => {
      fs.readFile(filename, 'utf-8', (err, source) => callback(err, filename, source));
    }
  ) as AsyncIterator<string>;

  glob('test-icons/*.svg', null, (err, files) => {
    async.eachSeries(files, testFile, err => {
      if (err) {
        t.end(err);
      } else {
        glob('node_modules/material-design-icons/**/svg/production/*.svg', null, (err, files) => {
          async.eachSeries(files, testFile, t.end);
        });
      }
    });
  });

});
