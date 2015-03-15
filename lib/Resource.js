var _ = require('underscore');

var ResourceIndex = require('./ResourceIndex');

var Resource = function(options) {};

/**
 * Sets up this resource with the provided options
 */
Resource.prototype.buildResourceWithOptions = function(options) {
    var defaults = this.getDefaults();
    this.settings = _.pick(
        _.defaults(options || {}, defaults),
        _.keys(defaults)
    );

    // If they passed an array of "dependsOn", use that
    // Otherwise, set it to an empty array.
    this.dependencies = (
        _.isArray(options.dependsOn) ? options.dependsOn : []
    );

    // Simple Read-Only property
    var key = ResourceIndex.catalog(this);
    this.getKey = function() {
        return key;
    };

};

Resource.prototype.getDefaults = function() {
    throw new Error('You must specify defaults for your resource type!');
};

Resource.prototype.dependsOn = function(dependency) {
    this.dependencies.push(dependency);
}

Resource.prototype.export = function() {
    var data = _.clone(this.settings);
    data.dependencies = _.map(_.uniq(this.dependencies), function(dependency) {
        return dependency.getKey();
    });
    data._type = this.resourceType;
    return data;
};

Resource.prototype.toString = function() {
    return "<" + this.resourceType + ":" + JSON.stringify(this.settings) + ">";
};

Resource.createType = function(type, defaults) {
    var NewType = function(options) {
        this.buildResourceWithOptions(options);
    };
    NewType.prototype = new Resource();
    NewType.prototype.resourceType = type;
    NewType.prototype.getDefaults = function() {
        return defaults;
    };

    return NewType;
};

module.exports = Resource;
