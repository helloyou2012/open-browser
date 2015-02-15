var Promise = require('bluebird');
var request = require('./request');

var init = module.exports = function init(ob) {
  return new Promise(function(resolve, reject) {
    // 当是本地或存在直接映射到本地
    if (ob.handlers.indexOf('remote') < 0) return resolve(ob);

    // 处理远程网络请求
    var req = ob.req,
      uri = ob.uri,
      conf = {
        req: req,
        res: ob.res,
        protocol: uri.protocol,
        options: {
          hostname: uri.hostname || req.headers.host,
          port: uri.port || req.port || (uri.protocol === 'https:' ? 443 : 80),
          path: uri.path,
          method: req.method,
          headers: req.headers,
          rejectUnauthorized: false
        }
      };
    request(conf).then(function(body) {
      ob.body = body;
      resolve(ob);
    }).catch(function() {
      resolve(ob);
    });
  });
};