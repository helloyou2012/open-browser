var Promise = require('bluebird');
var request = require('./request');

var init = module.exports = function init(ob) {
  return new Promise(function(resolve, reject) {
    // 非php文件或不支持php服务不予处理
    if (ob.handlers.indexOf('php') < 0) return resolve(ob);
    
    // 处理php文件请求
    var req = ob.req,
      uri = ob.uri,
      conf = {
        req: req,
        res: ob.res,
        protocol: uri.protocol,
        options: {
          hostname: '127.0.0.1',
          port: ob.php.port,
          path: ob.path,
          method: req.method,
          headers: req.headers,
          rejectUnauthorized: false
        }
      };
    request(conf).then(function(body) {
      if (ob.body && mapping && mapping.fun) {
        ob.body = mapping.fun(ob.body, body, ob);
      } else {
        ob.body = body;
      }
      resolve(ob);
    }).catch(function() {
      resolve(ob);
    });
  });
};