var Promise = require('bluebird');

/**
 * 数据结构：
 * OB: {
 *   proxy: {},
 *   proxyServer: 代理服务器
 *   data: {
 *     req: 请求
 *     res: 响应
 *   }
 * }
 */

var init = module.exports = function init() {
	var ob = this,
		proxy = ob.proxy,
		req = ob.data.req,
		res = ob.data.res;

	return new Promise(function(resolve, reject) {
		if (proxy && proxy.filter) {
			var route = {};
			if (proxy.filter instanceof RegExp) route.regex = proxy.filter;
			else route.string = proxy.filter;

			if (route.regex ? route.regex.test(req.url) : req.url === route.string) {

				ob.proxyServer.web(req, res, {
					target: proxy.domain
				});

				resolve(ob);
			} else {
				reject(new Error('no proxy'), ob);
			}
		} else {
			reject(new Error('no proxy'), ob);
		}


	});

};