module.exports = {

    toBeInstanceOf: function(expected) { return (this.actual instanceof expected); },
    toHaveLength:   function(expected) { return (this.actual.length === expected); },

    // Basic instance checks
    toBeFunction: function() { return (this.actual instanceof Function); },
    toBeObject:   function() { return (this.actual instanceof Object); },
    toBeNumber:   function() { return (this.actual === (this.actual+0)); },
    toBeArray:    function() { return (this.actual instanceof Array); },
    toBeString:   function() { return (this.actual instanceof String); },
};
