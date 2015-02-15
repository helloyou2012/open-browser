var portfinder = require('portfinder');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var env = process.env;
var cwd = process.cwd();



exports.createServer = function(cb) {
  portfinder.getPort({
    port: 3030,
    host: '127.0.0.1'
  }, function(err, port) {
    if (err) throw err;
    exec('php --version', {
      env: env,
      cwd: cwd
    }, function(error, stdout, stderr) {
      if (!error) {
        var server = spawn('php', ['-S', '127.0.0.1:' + port], {
          env: env,
          cwd: cwd,
          stdio: 'inherit'
        });
        cb && cb(server, port);
      }
    });

  });
}