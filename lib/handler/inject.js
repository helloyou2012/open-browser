var Promise = require('bluebird');

var init = module.exports = function init(ob) {
  return new Promise(function(resolve, reject) {
    var body = ob.body;
    var injects = ob.injects || [];

    for (var i = 0; i < injects.length; i++) {
      var inject = injects[i];

      for (var j = 0; j < inject.funs.length; j++) {
        var fun = inject.funs[j];
        if (typeof fun === 'function') {
          body = fun(body.toString(), ob);
        }
      }
    }
    ob.body = body;
    resolve(ob);
  });
}