var fs = require('fs'),
  util = require('util'),
  url = require('url'),
  path = require('path'),
  union = require('union'),
  ecstatic = require('ecstatic'),
  swig = require('swig');

var OpenBrowser = exports.OpenBrowser = function(options) {
  options = options || {};

  var self = this;

  if (options.root) {
    self.root = options.root;
  } else {
    self.root = './';
  }

  if (options.headers) {
    self.headers = options.headers;
  }

  if (options.config) {
    self.config = options.config;
  }

  self.cache = options.cache || 3600; // in seconds.
  self.showDir = options.showDir !== 'false';
  self.autoIndex = options.autoIndex !== 'false';

  swig.setDefaults({
    cache: false
  });

  if (options.ext) {
    self.ext = options.ext === true ? 'html' : options.ext;
  }

  self.server = union.createServer({
    before: (options.before || []).concat([

      function(req, res) {
        options.logFn && options.logFn(req, res);
        res.emit('next');
      },
      function(req, res) {
        var uri = url.parse(req.url, true);
        var params = uri.query;
        var file = uri.pathname;

        var found = self.serve(self.root + file, req, res, params);
        if (!found) {
          res.emit('next');
        }
      },
      ecstatic({
        root: self.root,
        showDir: self.showDir,
        cache: self.cache,
        autoIndex: self.autoIndex,
        defaultExt: self.ext
      })
    ]),
    headers: self.headers || {}
  });
};

OpenBrowser.prototype.validateFile = function(file, req, res, params) {
  fs.exists(file, function(exists) {
    if (exists) {
      return true;
    } else {
      res.writeHead(404, {
        'Content-Type': 'text/html'
      });
      res.end('File not found!');
      return false;
    }
  });
};

OpenBrowser.prototype.serve = function(file, req, res, params) {
  if (!this.validateFile(file, req, res, params))
    return false;

  var config = this.config || {};
  var ext = path.extname(file);
  if (config[ext]) {
    if (ext === 'html' || ext === 'php' || ext === 'htm') {
      swig.renderFile(file, {}, function(err, data) {
        if (err) {
          data = fs.readFileSync(file, 'utf8');
        }
        for (var handle_key in config[ext]) {
          var handle = config[ext][handle_key];
          if (typeof handle === 'function') {
            data = handle(data);
          }
        }
        res.end(data);
      });
    } else {
      fs.readFile(file, 'utf8', function(err, data) {
        if (err) {
          res.writeHead(500, {
            'Content-Type': 'text/html'
          });
          res.end('Server error!');
        } else {
          for (var handle_key in config[ext]) {
            var handle = config[ext][handle_key];
            if (typeof handle === 'function') {
              data = handle(data);
            }
          }
          res.end(data);
        }
      });
    }
    return true;
  }
  return false;

};

OpenBrowser.prototype.listen = function() {
  this.server.listen.apply(this.server, arguments);
};

OpenBrowser.prototype.close = function() {
  return this.server.close();
};

exports.createServer = function(options) {
  return new OpenBrowser(options);
};