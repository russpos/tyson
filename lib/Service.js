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

    try {
        var statusCheck = os.exec(command, ['status']);
    } catch (e) {
        Logger.warn(statusCheck);
        Logger.error(e);
        throw new Error("Could not check status on service " + this.settings.name);
    }
    Logger.debug(statusCheck);

    if (statusCheck.match(IS_RUNNING)) {
        Logger.debug(this.settings.name + ' is running');
        return true;
    } else if (isRetry) {
        throw new Error("Error starting service: " + this.settings.name); 
    } else if (statusCheck.status == IS_STOPPED) {
        os.exec(command, ['start']);
        this.checkStatusAndTry(os, hostInfo, true);
    } else {
        throw new Error("Error unknown service: " + this.settings.name); 
    }
}

Service.prototype.exec = function(os, hostInfo, chain) {
    // TODO -- Make fully async
    return chain.then(function() {
        this.checkStatusAndTry(os, hostInfo, false);
    }.bind(this));
};

Service.STATES = STATES;

module.exports = Service;
