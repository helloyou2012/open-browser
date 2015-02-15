'use strict';

var path = require('path');
var mime = require('mime');

var parse = require('./parse');
var util = require('./util');
var transport = require('./transport');

var Promise = require('bluebird');

module.exports = function(ob) {
  var opts = ob.config.spm || {};
  var root = ob.config.spm.root || process.cwd();
  var url = ob.uri.path;
  var res = ob.res;

  return new Promise(function(resolve) {
    var ignore = Array.isArray(opts.ignore) ? opts.ignore : [];
    var global = Array.isArray(opts.global) ? opts.global : [];

    var pkg = util.getPackage(root);
    var rootPkg = pkg;
    var match;
    if (pkg && (match = util.matchNameVersion(url))) {
      pkg = pkg.getPackage(match.name + '@' + match.version);
    }
    if (!pkg) {
      return resolve(null);
    }

    var file = parse(url, {
      pkg: pkg,
      rootPkg: rootPkg,
      rules: opts.rules
    });

    if (!file) {
      return resolve(null);
    }

    // nowrap
    if (!file.wrap) {
      resetContentType(res, path.extname(file.path));
      return resolve(file.contents);
    }

    var opt = {
      pkg: pkg,
      ignore: ignore,
      global: global
    };

    transport(file, opt, function(err, file) {
      var ext = path.extname(file.path);
      resetContentType(res, ext);
      resolve(file.contents);
    });
  });

};

function resetContentType(res, extname) {
  if (['.tpl', '.json', '.handlebars'].indexOf(extname) > -1) {
    extname = '.js';
  }
  res.setHeader('Content-Type', mime.lookup(extname));
}