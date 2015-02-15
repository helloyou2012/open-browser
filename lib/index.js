var http = require('http');
var net = require('net');
var colors = require('colors');

var connect = require('connect');
var logger = require('connect-logger');
var header = require('connect-header');
var ecstatic = require('ecstatic');
var serveIndex = require('serve-index');
var errorhandler = require('errorhandler');
var combo = require('./combo');

var phpserver = require('./phpserver');

var OpenBrowser = exports.OpenBrowser = function(options) {
  options = options || {};

  var self = this;
  // 服务器IP地址
  self.ip = options.ip;
  // 服务器端口号
  self.port = options.port;
  // 服务器root目录
  self.root = options.root ? options.root : process.cwd();
  // 服务器规则配置信息
  self.config = options.config ? options.config : {};
  // 注入header
  self.headers = options.headers ? options.headers : {};
  // 是否不输入日志
  self.silent = options.silent ? true : false;

  self.cache = options.cache || 3600; // in seconds.
  self.showDir = options.showDir != 'false';
  self.autoIndex = options.autoIndex != 'false';
  self.ext = options.ext ? options.ext : 'html';

};

// 初始化服务器
OpenBrowser.prototype._initServer = function() {
  var self = this;
  self.app = connect();
  // 是否输入日志
  !self.silent && self.app.use(logger());

  self.app.use(header(self.headers))
    .use(combo({
      ip: self.ip,
      port: self.port
    }))
    .use(function(req, res, next) {
      var ob = {
        ip: self.ip,
        port: self.port,
        root: self.root,
        config: self.config || {},
        php: self.php,
        req: req,
        res: res,
        handler: require('./handler')
      };
      ob.handler().then(function(data) {
        data.body ? res.end(data.body) : next();
      }).catch(function(err) {
        next();
      });
    })
    .use(serveIndex(self.root, {'icons': true}))
    .use(ecstatic({
      root: self.root,
      showDir: self.showDir,
      cache: self.cache,
      autoIndex: self.autoIndex,
      defaultExt: self.ext
    }))
    .use(errorhandler());

  self.server = http.createServer(self.app);
  // 绑定事件
  self._bindEvent();

  // php 服务器
  phpserver.createServer(function(server, port) {
    if (server && port) {
      self.php = {
        server: server,
        port: port
      };
    }
  });
};

OpenBrowser.prototype._bindEvent = function() {
  var self = this;

  // directly forward https request
  // TODO support https responders
  self.server.on('connect', function(req, socket, head) {
    // connect to an origin server
    var srvUrl = require('url').parse('http://' + req.url);
    try {
      var srvSocket = net.connect(srvUrl.port, srvUrl.hostname, function() {
        socket.write('HTTP/1.1 200 Connection Established\r\n' +
          'Proxy-agent: OpenBrowser-Proxy\r\n' +
          '\r\n');
        srvSocket.write(head);
        srvSocket.pipe(socket);
        socket.pipe(srvSocket);
      });
      srvSocket.on('error', function() {
        console.log('[https connect error]: ' + req.url.grey);
      });
    } catch (e) {
      console.log(e);
    }

  });

  // directly forward websocket 
  // TODO support websocket responders
  self.server.on('upgrade', function(req, socket, head) {
    socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
      'Upgrade: WebSocket\r\n' +
      'Connection: Upgrade\r\n' +
      '\r\n');
    socket.pipe(socket); // echo back
  });
};

OpenBrowser.prototype.listen = function() {
  // 初始化服务器
  this._initServer();
  this.server.listen.apply(this.server, arguments);
}

OpenBrowser.prototype.close = function() {
  // 退出时kill掉php服务器
  this.php && this.php.server.kill();
  return this.server.close();
}

exports.createServer = function(options) {
  return new OpenBrowser(options);
}