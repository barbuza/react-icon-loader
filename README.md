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
var React = require('react');

module.exports = function(props) {
  return React.createElement(
    'svg',
    Object.assign({}, { version: '1.1', viewBox: '0 0 16 16' }, props),
    React.createElement('path', { d: 'M8 0c-2.454 0-4.486 1.791-4.906 ...' })
  );
}
```
