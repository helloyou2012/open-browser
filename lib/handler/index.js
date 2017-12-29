var Promise = require('bluebird');
var url = require('url');
var colors = require('colors');
var _ = require('lodash');

var remote = require('./remote');
var local = require('./local');
var php = require('./php');
var render = require('./render');
var inject = require('./inject');

var join = require('path').join;
var extname = require('path').extname;

/**
 * 主要逻辑处理
 * @param  {Object} ob {
 *   ip,
 *   port,
 *   req,
 *   res,
 *   uri,
 *   mapping {
 *     filter,
 *     path,
 *     fun
 *   },
 *   path,
 *   isPhp,
 *   isLocal
 * }
 */
var init = module.exports = function init(ob) {
  var ob = this;

  // 路径映射处理
  // like:
  // g.tbcdn.cn => g.assets.daily.net
  // a/b/c/test.html => ./test.html
  if (Array.isArray(ob.config.paths)) {
    ob.config.paths.forEach(function(p) {
      ob.req.url = ob.req.url
        .replace(p[0], p[1])
        .replace('_local_', 'http://' + ob.ip + ':' + ob.port);
    });
  }
  ob.uri = url.parse(ob.req.url, true);

  // 路由到本地处理
  ob.mapping = parseMapping(ob.config.mappings, ob.req.url);

  // 文件路径处理
  ob.path = ob.uri.pathname;
  if (ob.mapping) {
    ob.path = ob.mapping.path;
  };

  // 获取文件和文件后缀
  ob.file = join(ob.root, ob.path);
  ob.ext = extname(ob.file);

  // 判断是否可以处理php文件
  ob.isPhp = !!ob.php && !!ob.path.match(/\.php$/);

  // 是否本地host
  ob.isLocal = _isLocal(ob);

  var handlers = [];
  if (ob.isLocal) {
    ob.isPhp ? handlers.push('php') : handlers.push('local');
  } else {
    if (!ob.mapping) {
      handlers.push('remote');
    } else {
      ob.mapping.fun && handlers.push('remote');
      ob.isPhp ? handlers.push('php') : handlers.push('local');
    }
  }

  // 是否需要swig渲染
  if (_.includes(['.html', '.php', '.htm'], ob.ext)) {
    handlers.push('render');
  }

  ob.handlers = handlers;

  // 注入函数提取
  ob.injects = [];
  var injects = ob.config.injects || [];
  for (var i = 0; i < injects.length; i++) {
    if (_endWith(ob.path, injects[i].type)) {
      ob.injects.push(injects[i]);
    }
  }

  return remote(ob)
    .then(php)
    .then(local)
    .then(render)
    .then(inject);
};

function parseMapping(mappings, url) {
  mappings = mappings || [];
  var _url = url.split('?')[0];

  for (var i = 0; i < mappings.length; i++) {
    if (mappings[i] && mappings[i].filter && mappings[i].path) {
      var route = {};

      if (mappings[i].filter instanceof RegExp)
        route.regex = mappings[i].filter;
      else
        route.string = mappings[i].filter;

      if (route.regex ? _url.match(route.regex) : _url === route.string) {
        return mappings[i];
      }
    }
  }
  return null;
};

function _isLocal(ob) {
  var host = ob.uri.hostname || 'localhost';
  var port = ob.uri.port || (ob.uri.protocol === 'https:' ? 443 : 80);

  if (host === 'localhost' || host === ob.ip || host === '127.0.0.1' || host === '0.0.0.0') {
    return ob.uri.port ? port == ob.port : true;
  } else {
    return false;
  }
};

var _endWith = function(str, suffix) {
  function _isEnd(_str, _suffix) {
    return _str.indexOf(_suffix, _str.length - _suffix.length) !== -1;
  }

  suffix = suffix.split('|');
  for (var i = 0; i < suffix.length; i++) {
    if (_isEnd(str, suffix[i])) return true;
  }
  return false;
}