var _ = require('underscore'),
    ResourceIndex = require('./ResourceIndex');

var Executor = {

    processQueue: function(queue, index, os, hostInfo) {
        _.each(queue, function(itemKey) {
            index.getResourceByKey(itemKey).exec(os, hostInfo);
        });
    },
    
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

                // Check first if this dependency already exists
                // in our executionOrder list.  If it has, then
                // skip it.
                if (_.contains(executionOrder, depKey)) {
                    continue;
                }

                // Ensure all dependencies are added first
                recurse(depObj);

                // Now add itself add the next thing to execute
                // since all of it's dependencies were met
                executionOrder.push(depKey);
            }
        };
        executionOrder.push(resourceObject.getKey());
        recurse(rawObject);
        return executionOrder;
    }

};

module.exports = Executor;
