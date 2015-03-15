var _ = require('underscore'),
    ResourceIndex = require('./ResourceIndex');

var Executor = {
    
    orderDependenciesForObject: function(resourceObject, catalog) {
        if (!catalog) {
            catalog = ResourceIndex.getCatalog();
        }
        var executionOrder = [],
            // Use the exported object, not the true object
            rawObject = catalog[resourceObject.getKey()];

        var recurse = function(object) {
            for (var depIndex in object.dependencies) {
                var depKey = object.dependencies[depIndex];
                var depObj = catalog[depKey];

                // This dependency has not yet been met
                if (!_.contains(executionOrder, depKey)) {
                    executionOrder.push(depKey);
                    recurse(depObj);
                }
            }
        };
        executionOrder.push(resourceObject.getKey());
        recurse(rawObject);
        return executionOrder.reverse();
    }

};

module.exports = Executor;
