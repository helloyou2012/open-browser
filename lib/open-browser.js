var url = require('url');
var path = require('path');
var union = require('union');
var ecstatic = require('ecstatic');
var httpProxy = require('http-proxy');

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

  if (options.proxy) {
    self.proxy = options.proxy;
  }

  self.cache = options.cache || 3600; // in seconds.
  self.showDir = options.showDir !== 'false';
  self.autoIndex = options.autoIndex !== 'false';

  if (options.ext) {
    self.ext = options.ext === true ? 'html' : options.ext;
  }

  // 代理服务器
  self.proxyServer = httpProxy.createProxyServer({});

  self.proxyServer.on('error', function(err, req, res) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end('Proxy error.');
  });

  self.server = union.createServer({
    before: (options.before || []).concat([

      function(req, res) {
        options.logFn && options.logFn(req, res);
        res.emit('next');
      },
      function(req, res) {
        self.proxyHandle(req, res);
      },
      function(req, res) {
        self.matchHandle(req, res);
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

/**
 * 文件内容匹配替换处理
 */
OpenBrowser.prototype.matchHandle = function(req, res) {
  var self = this,
    uri = url.parse(req.url, true),
    file = path.join(self.root, uri.pathname),
    ext = path.extname(file);

  if (self.config[ext]) {
    var ob = {
      config: self.config,
      data: {
        file: file,
        ext: ext
      },
      handle: require('./match')
    };

    ob.handle().then(function() {
      res.end(ob.data.content);
    }).catch(function(err) {
      res.emit('next');
    });
  } else {
    res.emit('next');
  }
}

/**
 * 代理处理
 */
OpenBrowser.prototype.proxyHandle = function(req, res) {
  var self = this;
  var ob = {
    proxy: self.proxy,
    proxyServer: self.proxyServer,
    data: {
      req: req,
      res: res
    },
    handle: require('./proxy')
  };

  ob.handle().then(function() {
    // do nothing
  }).catch(function(err) {
    res.emit('next');
  });
}

OpenBrowser.prototype.listen = function() {
  this.server.listen.apply(this.server, arguments);
}

OpenBrowser.prototype.close = function() {
  return this.server.close();
}

exports.createServer = function(options) {
  return new OpenBrowser(options);
}