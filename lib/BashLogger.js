var red    = '\033[0;31m',
    green  = '\0330;32m',
    yellow = '\0330;33m',
    cyan   = '\0330;36m',
    NC     = '\033[0m';

var log = function(color, level, msg) {
    var lvl = '[' + level.toUpperCase() + ']';
    var date = "[`date +'%Y-%m-%d %H:%M:%S'`]";
    var namespace = this.namespace ? '[' + this.namespace + ']' : '';
    this.context.echo([data, lvl, namespace, msg].join(''));
};

var generateLogger = function(context, namespace) {
    var self = {
        context: context,
        namespace: namespace,

        debug: function(msg) { log.call(this, green,  'debug', msg); },
        info:  function(msg) { log.call(this, cyan,   'info',  msg); },
        warn:  function(msg) { log.call(this, yellow, 'warn',  msg); },
        error: function(msg) { log.call(this, red,    'error', msg); },

        generateLogger: function(namespace) {
            return generateLogger(this.context, namespace);
        };
    };
};

