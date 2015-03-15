var Resource = require('./Resource'),
    _ = require('underscore');

/**
 * Bundles are no-op resources. You cannot access them
 * directly, but through the Bundle function you can 
 * create a bundle resource that has dependencies.
 *
 * For example, your application might not really be a resource
 * in that it's not a tangible OS level thing.
 *
 * But rather, it's a collection of things (files, a package,
 * a user, and a service to monitor).
 */
var Bundle = Resource.createType('Bundle', { title: 'Untitled' });

/**
 * Exec is a no-op
 */
Bundle.prototype.exec = function() {};

/**
 * Bundle is not exported directly, and therefore has a slightly
 * different syntax.
 *
 * Instead, bundle takes a function that will be used to define
 * it's internal dependencies.
 *
 * From there you will have a Bundle generator. For example, you
 * can define a bundle for a StaticWeb site, and then create
 * Bundle instances for each site on your host.
 */
module.exports = function(fn) {
    return function(opts) {
        var args = arguments;
        var b = new Bundle(opts);
        var context = {};
        fn.apply(context, args);

        _.each(context, function(value, name) {
            b.dependsOn(value);
            b[name] = value;
        });

        return b;
    };
};
