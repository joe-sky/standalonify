# standalonify
A Browserify plugin to make standalone UMD bundles. This is a fork of [dependify](https://github.com/rturnq/dependify).

## Installation
npm install -save standalonify

## Usage
```js
var browserify = require('browserify');
var standalonify = require('standalonify');

browserify({
  entries: 'your entry file'
}).plugin(standalonify, {
  name: 'moduleName',  //or set such as "['moduleName1', 'moduleName2']", can set more than one module name.
  deps: {
    'react': 'React',  // require('react') will use AMD's and CommonJS's require('react') or the React global object.
    'react-dom': 'ReactDOM'
  },
  hasAmdDeps: true  //If set to false will not generate amd dependency.
});
```

### License

MIT
