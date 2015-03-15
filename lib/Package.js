var Resource = require('./Resource'),
    Logger = require('./Logger').namespace('Package');

var PROVIDERS = {
    SYSTEM: 1
};

var STATES = {
    INSTALLED: 1,
    REMOVED: 2
};

var VERSION = {
    LATEST: 'latest'
};

var Package = Resource.createType('Package', {
    name: 'foo',
    ensure: STATES.INSTALLED,
    provider: PROVIDERS.SYSTEM,
    version: VERSION.LATEST
});

Package.prototype.exec = function(os, hostInfo) {
    // TODO: Handle states and other providers than apt
    // This should do a lot more 
    var packageName = [this.settings.name];
    if (this.settings.version !== Package.VERSION.LATEST) {
        packageName.push(this.settings.version);
    }
    var packageString = packageName.join('=');

    // Exec aptget install
    Logger.debug('Attempting to install ' + packageString);

    try {
        var value = os.exec("apt-get", ['install', packageString]);
    } catch (e) {
        Logger.warn(value);
        throw new Error("Could not install package " + packageString);
    }

    Logger.debug(value);
};

Package.PROVIDERS = PROVIDERS;
Package.STATES    = STATES;
Package.VERSION   = VERSION;

module.exports = Package;
