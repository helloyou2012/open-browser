var fs = require("fs");
var Promise = require('bluebird');
var _ = require('lodash');
var spm = require('../spm');

var init = module.exports = function init(ob) {
  return new Promise(function(resolve, reject) {
    if (ob.handlers.indexOf('local') < 0) return resolve(ob);

    var isPage = _.contains(['.html', '.php', '.htm'], ob.ext);
    var isSpm = !!ob.config.spm;
    var isInject = !!ob.injects.length;

    function _callback(body) {
      if (ob.body && ob.mapping && ob.mapping.fun) {
        ob.body = ob.mapping.fun(ob.body, body, ob);
      } else {
        ob.body = body;
      }
      resolve(ob);
    };

    if (isPage || isInject || ob.mapping) {
      // 处理页面
      fs.readFile(ob.file, 'utf8', function(err, body) {
        if (err) {
          resolve(ob);
        } else {
          _callback(body);
        }
      });
    } else if (isSpm) {
      spm(ob).then(function(body) {
        _callback(body);
      });
    } else {
      resolve(ob);
    }

  });
}