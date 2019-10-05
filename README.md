# react-icon-loader [![Build Status](https://github.com/barbuza/react-icon-loader/workflows/Node%20CI/badge.svg)](https://github.com/barbuza/react-icon-loader/actions)

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

var hoisted0 = createElement('path', { d: 'M8 0c-2.454 0-4.486 1.791-4.906 ...' });

function reactIcon(props) {
  return createElement(
    'svg',
    __assign({ version: '1.1', viewBox: '0 0 16 16' }, props),
    hoisted0
  );
}

if (process.env.NODE_ENV !== 'production') {
  reactIcon.displayName = 'react-icon(filename.svg)';
}

module.exports = memo(reactIcon);
```
