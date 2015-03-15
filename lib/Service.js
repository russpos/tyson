Resource = require('./Resource');

var IS_RUNNING = 0,
    IS_STOPPED = 3;

var STATES = {
    RUNNING: 1,
    STOPPED: 2,
};

var Service = Resource.createType('Service', {
    name: 'foo',
    ensure: STATES.RUNNING,
});

Service.prototype.checkStatusAndTry = function(os, hostInfo, isRetry) {
    var statusCommand = '/etc/init.d/' + this.settings.name + ' status';
    var startCommand = '/etc/init.d/' + this.settings.name + ' start';
    var status = os.sh.run(statusCommand);

    if (status == IS_RUNNING) {
        return true;
    } else if (isRetry) {
        throw new Error("Error starting service: " + this.settings.name); 
    } else if (status == IS_STOPPED) {
        os.sh.run(startCommand);
        this.checkStatusAndTry(os, hostInfo, true);
    } else {
        throw new Error("Error unknown service: " + this.settings.name); 
    }
}

Service.prototype.exec = function(os, hostInfo) {
    this.checkStatusAndTry(os, hostInfo, false);
};

Service.STATES = STATES;

module.exports = Service;
