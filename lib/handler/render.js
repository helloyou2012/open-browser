var Promise = require('bluebird');
var swig = require('swig');
var _ = require('lodash');

var init = module.exports = function init(ob) {
  return new Promise(function(resolve, reject) {
    if (ob.handlers.indexOf('render') < 0) return resolve(ob);

    try {
      // no cache
      swig.setDefaults({
        cache: false
      });

      ob.body = swig.render(ob.body.toString(), {
        filename: ob.file
      });
      resolve(ob);
    } catch (e) {
      resolve(ob);
    }
  });
}