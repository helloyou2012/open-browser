# open-browser: a command-line http server for debug

> `open-browser` is a simple, command-line http server for debug demo pages.

## Installing globally:

Installation via `npm`.  If you don't have `npm` yet:

     curl https://npmjs.org/install.sh | sh
     
Once you have `npm`:

     npm install open-browser -g
     
This will install `open-browser` globally so that it may be run from the command line.

## Features:

1. 支持php解析
2. 支持模板渲染（目前仅swig模板）
3. 支持多环境切换（debug、daily）
4. 支持代理功能
5. 支持spm，新增global参数屏蔽transport

## Usage:

     open-browser [path] [options]

`[path]` defaults to `./`.

```
// using default config
open-browser -e debug

// using spm config
open-browser -e spm

// using yourself config
open-browser -t -e selfenv

// setup system proxy (need sudo password)
open-browser -t -e selfenv --sysproxy
```

## Available Options:

`-p` Port to listen for connections on (defaults to 8080)

`-e` Set environment: [none], debug, daily, spm.

`--clean` Clean proxy settings.

`--sysproxy` Setup system proxy.

`--cors` Enable CORS via the 'Access-Control-Allow-Origin' header.

`-s` or `--silent` In silent mode, log messages aren't logged to the console.

`-h` or `--help` Displays a list of commands and exits.

`-t` Using template handler 'browser-config.js'.

## Handlers template:

You can add yourself handler like that on root dir (filename: browser-config.js):

```
// browser-config.js
module.exports = {
    'selfenv': {
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
        spm: {
            global: ['/src/lib/**/*.js', '/demo/js/**/*.js']
        },
        injects: [{
            type: '.html|.php|.htm',
            funs: [
                replace_css,
                replace_js,
                replace_domain
            ]
        }]
    }
}；
```
