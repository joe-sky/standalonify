var through = require('through2'),
  template = require('lodash/template');

var prefix = "(function(_g){(function(f){var r=(typeof require==='function'?require:function(name){return <%= depsMap %>[name];});"
  + "if (typeof exports==='object'&&typeof module!=='undefined'){module.exports=f(r)}"
  + "else if(typeof define==='function'&&define.amd){define(<%= depsKeys %>,f.bind(_g,r))}else{f(r)}})(function(require,define,module,exports){var _m=";

var suffix = "var _r=_m(<%= moduleKey %>);<%= globalDefine %>_r;return _r;})})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:(typeof self!=='undefined'?self:this)));";

function createStream(prefix, suffix) {
  var first = true;

  return through(function (chunk, encoding, next) {
    if (first) {
      this.push(new Buffer(prefix()));
      first = false;
    }
    this.push(chunk);
    next();
  }, function (next) {
    this.push(new Buffer(suffix()));
    next();
  });
}

module.exports = function (b, opts) {
  if (!opts) {
    throw new Error('Please provide some options to the plugin');
  } else if (opts.name == null) {
    throw new Error('Please specifiy a name for the module');
  }

  var deps = opts.deps,
    keys = [];
  if (deps) {
    keys = Object.keys(deps);
  }
  else {
    prefix = "(function(_g){(function(f){if(typeof exports==='object'&&typeof module!=='undefined'){module.exports=f()}"
      + "else if(typeof define==='function'&&define.amd){define([],f.bind(_g))}else{f()}})(function(define,module,exports){var _m =";
  }

  var tmplP = template(prefix),
    tmplS = template(suffix);

  function applyPlugin() {
    return b.external(keys)
        .pipeline.get('wrap')
        .push(createStream(function () {
          if (deps) {
            return tmplP({
              depsKeys: opts.hasAmdDeps === false ? '[]' : JSON.stringify(keys),
              depsMap: '{' + keys.map(function (key) {
                return JSON.stringify(key) + ":" + deps[key];
              }).join(',') + '}'
            });
          }
          else {
            return prefix;
          }
        }, function () {
          return tmplS({
            // This is pretty hacky but Browserify has the standalone mode internalized
            moduleKey: b._bpack.standaloneModule,
            globalDefine: (Array.isArray(opts.name) ? opts.name : [opts.name]).map(function (name) {
              return '_g.' + name + '=';
            }).join('')
          });
        }));
  }

  b.on('reset', applyPlugin);

  return applyPlugin();
};