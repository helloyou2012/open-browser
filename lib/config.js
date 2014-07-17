module.exports = {
    'debug': {
        '.html': {
            replace_css: function(data) {
                return data.replace(/<link[^>]*href=\"([^\"]+)\"[^>]*>/gi, function(wholeMatch, m1) {
                    return m1.replace(/-min/gi, '').replace(/(.*)\?\?(.*)/, function(wholeMatch, m1_, m2_) {
                        return m2_.split(',').map(function(item) {
                            return '<link type="text/css" rel="stylesheet" href="' + m1_ + item + '">';
                        }).join('');
                    });
                });
            },
            replace_js: function(data) {
                return data.replace(/<script[^>]*src=\"([^\"]+)\"[^>]*>.*<\/script>/gi, function(wholeMatch, m1) {
                    return m1.replace(/-min/gi, '').replace(/(.*)\?\?(.*)/, function(wholeMatch, m1_, m2_) {
                        return m2_.split(',').map(function(item) {
                            return '<script src="' + m1_ + item + '"></script>';
                        }).join('');
                    });
                });
            },
            replace_domain: function(data) {
                return data.replace(/(http|https):\/\/g.tbcdn.cn\/ebook\/client\/[^\/'\"]+/gi, './src')
                    .replace(/\/\/g.tbcdn.cn\/ebook\/client\/[^\/'\"]+/gi, './src');
            }
        }
    }
};
