var _ = require('underscore');
var counter = 1;
var index = {};

module.exports = {

    getCatalog: function() {
        var catalog = {};
        for (var i in index) {
            catalog[i] = index[i].export();
        }
        return catalog;
    },

    catalog: function(resourceObject) {
        if (_.isFunction(resourceObject.getKey)) {
            throw new Error("Cannot re-catalog object!");
        }
        counter++;
        index[counter] = resourceObject;
        return counter;
    }

};
