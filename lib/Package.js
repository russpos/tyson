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

/**
 * Ensure the package is either installed or removed.
 *
 * @param Context os The Context used to execute these functions
 * @param Object hostInfo Additional data about the host being provisioned
 */
Package.prototype.exec = function(os, hostInfo) {
    // TODO:Handle both installed and removed.

    var packageName = [this.settings.name];
    if (this.settings.version !== Package.VERSION.LATEST) {
        packageName.push(this.settings.version);
    }

    // TODO -- Delegate to a package provider rather than call commands
    var packageString = packageName.join('=');
    Logger.debug('Attempting to install ' + packageString);

    os.execRaw("apt-get install -y "+packageString);
    os.ifLastStatementNonZero({
        as: this,
        then: function() {
            os.error('Failed installing ' + packageString);
        }
    });
    return true;
};

Package.PROVIDERS = PROVIDERS;
Package.STATES    = STATES;
Package.VERSION   = VERSION;

module.exports = Package;
