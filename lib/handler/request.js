var Promise = require('bluebird');
var http = require('http');
var https = require('https');
var zlib = require('zlib');

var init = module.exports = function init(conf) {
  return getPostData(conf).then(sendRequest);
};

function getPostData(conf) {
  return new Promise(function(resolve, reject) {
    var chunks = [];
    conf.req.on("data", function(chunk) {
      chunks.push(chunk);
    });
    conf.req.on("end", function() {
      conf.postData = Buffer.concat(chunks);
      resolve(conf);
    });
  });
};

function sendRequest(conf) {
  // 有些接口校验referer,这里将其删除
  delete conf.options.headers["referer"];
  conf.options.headers["content-length"] = conf.postData.length;

  return new Promise(function(resolve, reject) {
    // Create request
    var _request = (conf.protocol === 'https:' ? https : http).request(conf.options, function(res) {
      var headers = res.headers || [];
      var encoding = headers['content-encoding'];

      var callback = function(data) {
        delete headers['content-encoding'];
        delete headers['content-length'];
        conf.res.writeHead(res.statusCode, headers);
        resolve(data);
      };

      var chunks = [];
      res.on('data', function(chunk) {
        chunks.push(chunk);
      });

      res.on("end", function() {
        var buffer = Buffer.concat(chunks);
        // handler gzip & defalte transport
        if (encoding == 'gzip') {
          zlib.gunzip(buffer, function(err, decoded) {
            callback(decoded);
          });
        } else if (encoding == 'deflate') {
          zlib.inflate(buffer, function(err, decoded) {
            callback(decoded);
          });
        } else {
          callback(buffer);
        }
      });

      res.on('error', function(err) {
        reject(err);
      });
    });
    // Bind error event
    _request.on("error", function(err) {
      reject(err);
    });
    // Send post data
    _request.end(conf.postData);
  });
};