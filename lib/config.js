function replace_css(data) {
    return data.replace(/-min\.css/gi, '.css');
}

function replace_js(data) {
    return data.replace(/-min\.js/gi, '.js');
}

function replace_domain(data, ob) {
    return data.replace(/\/build\//gi, 'http://' + ob.ip + ':' + ob.port + '/src/');
}

function injectJsBridge(data) {
    var js = '!window.AlipayJSBridge && (window.AlipayJSBridge = {' +
        'call: function(key, data, cb) {' +
        'console.log(arguments);' +
        'cb && cb();' +
        '}' +
        '});';
    var script = '<script type="text/javascript">' + js + '</script>';
    return data.replace(/<\/head>/, script + '</head>');
}

module.exports = {
    /*'demo': {
        paths: [
            ['dist', 'src'],
            ['www', 'src']
        ],
        mappings: [{
            filter: /taobao\.com/,
            path: '/index.html'
        }, {
            filter: /taobao\.com/,
            path: '/index.html',
            fun: function(oldData, newData, ob) {
                return newData;
            }
        }],
        spm: {},
        injects: [{
            type: '.html|.php|.htm',
            funs: [
                replace_css,
                replace_js,
                replace_domain
            ]
        }]
    }*/
    'none': {},
    'spm': {
        spm: {},
        injects: [{
            type: '.html|.php|.htm',
            funs: [injectJsBridge]
        }]
    },
    'debug': {
        injects: [{
            type: '.html|.php|.htm',
            funs: [replace_css, replace_js, replace_domain]
        }]
    }
};