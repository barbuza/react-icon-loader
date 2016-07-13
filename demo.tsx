import * as fs from 'fs';
import * as glob from 'glob';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import * as async from 'async';
import loader from './index';

const css = `
.icon { width: 24px; height: 24px }
.row:nth-child(odd) .icon { fill: green; }
`;

glob('node_modules/material-design-icons/device/svg/production/*_48px.svg', null, (err, files) => {
  async.map(files, (filename, callback) => {
    fs.readFile(filename, 'utf-8', (err, source) => {
      function cb(err, js) {
        callback(null, { component: eval(js), filename });
      }

      loader.call({ resourcePath: filename, async: () => cb }, source);
    });
  }, (err, results: Array<{ component: any, filename: string }>) => {
    fs.writeFile('demo.html', ReactDOMServer.renderToStaticMarkup(
      <html>
      <head>
        <style dangerouslySetInnerHTML={ { __html: css } }/>
      </head>
      <body>
      {results.map((item, index) =>
        <div key={index} className='row'>
          <div>{item.filename}</div>
          <div>{React.createElement(item.component, { className: 'icon' })}</div>
        </div>
      )}
      </body>
      </html>
    ));
  });
});
