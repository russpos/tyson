var colors = require('colors/safe');

var levels = {
    debug: colors.green,
    info: colors.cyan,
    warn: colors.yellow,
    error: colors.red,
};


var createLogger = function(namespace) {
    var Logger = {};

    for (var level in levels) {
        Logger[level] = (function(lvl) {
            return function(msg) {
                var d = (new Date());
                var dateString = [
                    d.getFullYear(),
                    '-',
                    (d.getMonth()+1),
                    '-',
                    d.getDate(),
                    ' ',
                    d.getHours(),
                    ':',
                    d.getMinutes(),
                    ':',
                    d.getSeconds()
                ].join('');
                var parts = [
                    levels[lvl]('[' + dateString + ']'),
                    levels[lvl]('[' + lvl.toUpperCase() + ']'),
                    ('[' + (namespace||'default') + ']'),
                    msg
                ]
                console.log(parts.join(' '));
            };
        })(level);
    }
    return Logger;
};

var Logger = createLogger();
Logger.namespace = createLogger;

module.exports = Logger;

