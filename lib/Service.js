var Resource = require('./Resource'),
    Logger = require('./Logger').namespace('Service');

var IS_RUNNING = /is running/,
    IS_STOPPED = 3;

var STATES = {
    RUNNING: 1,
    STOPPED: 2,
};

var Service = Resource.createType('Service', {
    name: 'foo',
    ensure: STATES.RUNNING,
});

// TODO: Be able to support other service mechanisms
// TODO: Be able to trigger reload
Service.prototype.checkStatusAndTry = function(os, hostInfo, isRetry) {
    var command = '/etc/init.d/' + this.settings.name;
    os.execRaw(command + ' status');
    os.ifLastStatementSucceeded({
        as: this,
        then: os.noop(),
        lse: function() {
            os.execRaw(command + ' start');
            os.ifLastStatementNonZero({
                as: this,
                then: function() {
                    os.error('Could not start: ' + this.settings.name);
                }
            });
        }
    });
}

Service.prototype.exec = function(os, hostInfo) {
    this.checkStatusAndTry(os, hostInfo, false);
};

Service.STATES = STATES;

module.exports = Service;
