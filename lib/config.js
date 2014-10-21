var replace_css = function(data) {
    return data.replace(/<link[^>]*href=\"([^\"]+)\"[^>]*>/gi, function(wholeMatch, m1) {
        if (m1.indexOf('??') >= 0)
            return m1.replace(/-min/gi, '').replace(/(.*)\?\?(.*)/, function(wholeMatch, m1_, m2_) {
                return m2_.split(',').map(function(item) {
                    return '<link type="text/css" rel="stylesheet" href="' + m1_ + item + '">';
                }).join('');
            });
        else
            return wholeMatch.replace(/-min/gi, '');
    });
};

var replace_js = function(data) {

    return data.replace(/<script[^>]*src=\"([^\"]+)\"[^>]*>.*<\/script>/gi, function(wholeMatch, m1) {
        if (m1.indexOf('??') >= 0)
            return m1.replace(/-min/gi, '').replace(/(.*)\?\?(.*)/, function(wholeMatch, m1_, m2_) {
                return m2_.split(',').map(function(item) {
                    return '<script src="' + m1_ + item + '"></script>';
                }).join('');
            });
        else
            return wholeMatch.replace(/-min/gi, '');
    });

};

var replace_domain = function(data) {
    var path = require('path'),
        app_name = process.cwd().split(path.sep).pop(),
        re = new RegExp('(https?|)://g.tbcdn.cn/ebook/' + app_name + '/\\d+.\\d+.\\d+/', 'gi');
    return data.replace(re, '/src/');
};

var replace_cdn = function(data) {
    return data.replace(/g\.tbcdn\.cn\/ebook/gi, 'g.assets.daily.taobao.net/ebook');
};

module.exports = {
    /*'proxy': {
        'filter': 正则表达式,
        'domain': 代理域名
    },*/
    'none': {
        '.html': {},
        '.php': {}
    },
    'debug': {
        '.html': {
            replace_css: replace_css,
            replace_js: replace_js,
            replace_domain: replace_domain
        },
        '.php': {
            replace_css: replace_css,
            replace_js: replace_js,
            replace_domain: replace_domain
        }
    },
    'daily': {
        '.html': {
            replace_cdn: replace_cdn
        },
        '.php': {
            replace_cdn: replace_cdn
        }
    }
};