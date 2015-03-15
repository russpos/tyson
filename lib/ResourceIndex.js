var _ = require('underscore');
var counter = 1;
var index = {};

module.exports = {

    // Get simplified catalog of objects
    getCatalog: function() {
        var catalog = {};
        for (var i in index) {
            catalog[i] = index[i].export();
        }
        return catalog;
    },

    // Get object by key
    getResourceByKey: function(key) {
        return index[key];
    },

    // Adds resource object to the catalog
    catalog: function(resourceObject) {
        if (_.isFunction(resourceObject.getKey)) {
            throw new Error("Cannot re-catalog object!");
        }
        counter++;
        index[counter] = resourceObject;
        return counter;
    }

};
