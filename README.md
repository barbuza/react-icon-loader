# react-icon-loader [![Build Status](https://travis-ci.org/barbuza/react-icon-loader.svg?branch=master)](https://travis-ci.org/barbuza/react-icon-loader)

load svg icons as react components through SVGO

## how it works

```xml
<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1"
     width="16" height="16" viewBox="0 0 16 16">
  <path d="M8 0c-2.454 0-4.486 1.791-4.906 ..."/>
</svg>
```

converted to

```js
var createElement = require("react").createElement;
var memo = require("react").memo;
var __assign = require("tslib").__assign;

function reactIcon(props) {
  return createElement(
    'svg',
    __assign({ version: '1.1', viewBox: '0 0 16 16' }, props),
    createElement('path', { d: 'M8 0c-2.454 0-4.486 1.791-4.906 ...' })
  );
}

if (process.env.NODE_ENV !== 'production') {
  reactIcon.displayName = 'react-icon(filename.svg)';
}

module.exports = reactIcon;
```
