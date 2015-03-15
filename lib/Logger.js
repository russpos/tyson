var colors = require('colors/safe');

var levels = {
    debug: colors.green,
    info: colors.cyan,
    warn: colors.yellow,
    error: colors.red,
};

/**
 * Creates a logger instance.  Loggers will have have 5 functions:
 *  - debug
 *  - info
 *  - warn
 *  - error
 *  - namespace
 *
 * The first 4 are different levels of logging.  Namespace, however, returns
 * a new logger configured with a certain log prefix.  Handy for grouping
 * relevant log lines together (such as by using one namespace per file).
 */
var createLogger = function(namespace) {
    var Logger = {};

    for (var level in levels) {
        Logger[level] = (function(lvl) {
            return function(msg) {
                var d = (new Date());
                // TODO -- Pretty log messages
                var dateString = d.valueOf();
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

