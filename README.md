# open-browser: a command-line http server for debug

`open-browser` is a simple, command-line http server for debug demo pages.

# Installing globally:

Installation via `npm`.  If you don't have `npm` yet:

     curl https://npmjs.org/install.sh | sh
     
Once you have `npm`:

     npm install open-browser -g
     
This will install `open-browser` globally so that it may be run from the command line.

## Usage:

     open-browser [path] [options]

`[path]` defaults to `./`.

## Available Options:

`-p` Port to listen for connections on (defaults to 8080)

`-a` Address to bind to (defaults to '0.0.0.0')

`-d` Show directory listings (defaults to 'True')

`-i` Display autoIndex (defaults to 'True')

`-e` or `--ext` Default file extension (defaults to 'html')

`-s` or `--silent` In silent mode, log messages aren't logged to the console.

`-h` or `--help` Displays a list of commands and exits.

`-t` Using template handler 'config.js'.

`-c` Set cache time (in seconds) for cache-control max-age header, e.g. -c10 for 10 seconds. To disable caching, use -c-1.

## Handlers template:

You can add yourself handler like that on root dir (filename: browser-config.js):

```
// browser-config.js
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
```
