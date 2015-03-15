var _ = require('underscore'),
    os = require('./SystemTools'),
    ResourceIndex = require('./ResourceIndex');

var Executor = {

    /** 
     * Main method.  Provision a resource on to the current host.
     * This is how you actually provision a machine with a set of 
     * resources.
     *
     * @param Resource resourceObject The resource object we will provision
     *  on to this machine.  Usually a Bundle.
     * @param Object data Additional data provided for the purpose of provisioning.
     */
    provision: function(resourceObject, data) {
        var queue = this.orderDependenciesForObject(resourceObject,
                                                ResourceIndex.getCatalog());
        this.processQueue(queue, ResourceIndex, os, data);
    },

    /**
     * Processes a queue of resources by looking them up in the ResourceIndex
     * and calling exec on each of them, in order.
     *
     * @param Array queue Ordered list of resource keys
     * @param ResourceIndex index The ResourceIndex to use.
     * @param SystemTools os A copy of the SystemTools helper to use
     * @param Object hostInfo Dictionary of additional info to help decide
     *  how to provision each individual resource
     */
    processQueue: function(queue, index, os, hostInfo) {
        _.each(queue, function(itemKey) {
            index.getResourceByKey(itemKey).exec(os, hostInfo);
        });
    },

    /**
     * For a given resource object, return an array of resource keys
     * from the resource catalog that tells the system which resources
     * needed to be done in which order.
     *
     * @param Resource resourceObject The resource object you are tracking dependencies for
     * @param Object catalog ResourceIndex catalog to use.
     *  If not provided, it will get it from the ResourceIndex
     */
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
