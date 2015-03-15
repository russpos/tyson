Resource = require('./Resource');

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

Package.PROVIDERS = PROVIDERS;
Package.STATES    = STATES;
Package.VERSION   = VERSION;

module.exports = Package;
