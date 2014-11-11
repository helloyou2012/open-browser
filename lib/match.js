var fs = require("fs");
var Promise = require('bluebird');
var swig = require('swig');
var _ = require('lodash');
var exec = require('child_process').exec;

// no cache
swig.setDefaults({
	cache: false
});

/**
 * 数据结构：
 * OB: {
 *   config: {},
 *   data: {
 *     file: 文件名称
 *     ext: 文件后缀
 *     content: 文件内容
 *     req: 请求
 *     res: 响应
 *   }
 * }
 */

var init = module.exports = function init() {
	var ob = this;

	return new Promise(function(resolve, reject) {

		phpHandle(ob)
			.catch(getContent)
			.then(renderHandle)
			.then(replaceHandle)
			.then(resolve)
			.catch(reject);

	});

};

function phpHandle(ob) {
	return new Promise(function(resolve, reject) {
		if (ob.data.ext != '.php') {
			reject(ob);
		} else {
			exec('php ' + ob.data.file, {
				env: process.env,
				cwd: process.cwd()
			}, function(error, stdout, stderr) {
				if (error) {
					reject(ob);
				} else {
					ob.data.content = stdout;
					resolve(ob);
				}
			});
		}
	});
}

function getContent(ob) {
	return new Promise(function(resolve, reject) {
		fs.readFile(ob.data.file, 'utf8', function(err, content) {
			if (err) {
				reject(err);
			} else {
				ob.data.content = content;
				resolve(ob);
			}
		});
	});
}

function renderHandle(ob) {
	return new Promise(function(resolve, reject) {
		// regex: /(html?|php)/.test();
		if (_.contains(['.html', '.php', '.htm'], ob.data.ext)) {
			try {
				ob.data.content = swig.render(ob.data.content, {
					filename: ob.data.file
				});
			} catch (e) {
				// do nothing
			}
		}
		resolve(ob);
	});
}

function replaceHandle(ob) {
	return new Promise(function(resolve, reject) {
		var ext = ob.data.ext;
		var content = ob.data.content;

		for (var handle_key in ob.config[ext]) {
			var handle = ob.config[ext][handle_key];
			if (typeof handle === 'function') {
				content = handle(content);
			}
		}

		ob.data.content = content;
		resolve(ob);
	});
}