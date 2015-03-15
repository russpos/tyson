Resource = require('./Resource');

var STATES = {
    RUNNING: 1,
    STOPPED: 2,
};

var Service = Resource.createType('Service', {
    name: 'foo',
    ensure: STATES.RUNNING,
});

Service.STATES = STATES;

module.exports = Service;
