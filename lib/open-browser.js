var fs = require('fs'),
    util = require('util'),
    union = require('union'),
    ecstatic = require('ecstatic');

var OpenBrowser = exports.OpenBrowser = function (options) {
  options = options || {};

  if (options.root) {
    this.root = options.root;
  }
  else {
    this.root = './';
  }

  if (options.headers) {
    this.headers = options.headers;
  }

  if (options.config) {
    this.config = options.config;
  }

  this.cache = options.cache || 3600; // in seconds.
  this.showDir = options.showDir !== 'false';
  this.autoIndex = options.autoIndex !== 'false';

  if (options.ext) {
    this.ext = options.ext === true
      ? 'html'
      : options.ext;
  }

  this.server = union.createServer({
    before: (options.before || []).concat([
      function (req, res) {
        options.logFn && options.logFn(req, res);
        res.emit('next');
      },
      function (req, res) {
        var uri = url.parse(req.url, true);
        var params = uri.query;
        var file = uri.pathname;
        
        var found = this.serve(this.root + file, req, res, params);
        if (!found) {
          res.emit('next');
        }
      },
      ecstatic({
        root: this.root,
        cache: this.cache,
        showDir : this.showDir,
        autoIndex: this.autoIndex,
        defaultExt: this.ext
      })
    ]),
    headers: this.headers || {}
  });
};

OpenBrowser.prototype.serve = function(file, req, res, params) {
    var config = this.config || {};
    for (var key in params) {
      var ext = path.extname(file);
      if (config[key] && config[key][ext]) {
        fs.exists(file, function(exists) {
          if (exists) {
            fs.readFile(file, 'utf8', function(err, data) {
                if (err) {
                  res.writeHead(500, {'Content-Type': 'text/html'});
                  res.end('Server error!');
                } else {
                  for (var handle_key in config[key][ext]) {
                    var handle = config[key][ext][handle_key];
                    if (typeof handle === 'function') {
                        data = handle(data);
                    }
                  }
                  res.end(data);
                }
            });
          } else {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('File not found!');
          }
        });
        return true;
      }
    }
    return false;
};

OpenBrowser.prototype.listen = function () {
  this.server.listen.apply(this.server, arguments);
};

OpenBrowser.prototype.close = function () {
  return this.server.close();
};

exports.createServer = function (options) {
  return new OpenBrowser(options);
};
