var Resource = require('./Resource'),
    _ = require('underscore');

// Bundles are no-op resources. You cannot access them
// directly, but through the Bundle function you can 
// create a bundle resource that has dependencies.
//
// For example, your application might not really be a resource
// in that it's not a tangible OS level thing.
//
// But rather, it's a collection of things (files, a package,
// a user, and a service to monitor).
var Bundle = Resource.createType('Bundle', { title: 'Untitled' });

// We don't export bundle directly. Instead, we export
// a function that takes a function to define a bundle
//
module.exports = function(fn) {
    return function(opts) {
        var b = new Bundle(opts);
        var context = {};
        fn.call(context, opts);

        _.each(context, function(value, name) {
            b.dependsOn(value);
            b[name] = value;
        });

        return b;
    };
};
