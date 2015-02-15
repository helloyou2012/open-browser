var parse = require('url').parse;
var combo = require('combo-url');
var Promise = require('bluebird');
var request = Promise.promisify(require("request"));

function _isLocal(url, opt) {
  var uri = parse(url);
  var host = uri.host || 'localhost';
  var port = uri.port || (uri.protocol === 'https:' ? 443 : 80);

  if (host === 'localhost' || host === opt.ip || host === '127.0.0.1' || host === '0.0.0.0') {
    return uri.port ? port === opt.port : true;
  } else {
    return false;
  }
};

module.exports = function(opt) {

  return function(req, res, next) {
    var _url = req.url;
    try {
      _url = decodeURIComponent(req.url);
    } catch (e) {}


    // Pass through when is not a combo url
    if (!combo.isCombo(_url) || !_isLocal(req.url, opt)) {
      return next();
    }

    var data = combo.parse(_url);

    Promise.reduce(data.combo, function(ret, item) {
      var url = 'http://' + opt.ip + ':' + opt.port + item;
      return request(url).then(function(contents) {
        return ret + '\n' + contents[0].body;
      });
    }, '').then(function(ret) {
      res.end(ret);
    }).catch(function(e) {
      res.writeHead(404);
      res.end('File not found!');
    });
  };
};