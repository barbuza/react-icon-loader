import * as fs from 'fs';
import * as glob from 'glob';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import loader from './index';

function Html(props: { children: Array<React.ReactChild> }): JSX.Element {
  return (
    <html>
    <head>
      <style dangerouslySetInnerHTML={ { __html: '.icon { width: 24px; height: 24px }'} }/>
    </head>
    <body>
    {props.children}
    </body>
    </html>
  );
}

glob('node_modules/material-design-icons/device/svg/production/*.svg', null, (err, files) => {
  const children = [];

  function runNext() {
    if (!files.length) {
      const tree = React.createElement.apply(null, [Html, null].concat(children));
      const html = ReactDOMServer.renderToStaticMarkup(tree);
      fs.writeFile('demo.html', html);
      return;
    }
    const filename = files.shift();
    fs.readFile(filename, 'utf-8', (err, source) => {
      function callback(err, js) {
        const comp = eval(js);
        children.push(
          <div>
            <div>{filename}</div>
            <div>{React.createElement(comp, { className: 'icon' })}</div>
          </div>
        );
        process.nextTick(runNext);
      }

      loader.call({ resourcePath: filename, async: () => callback }, source);
    });
  }

  runNext();
});
