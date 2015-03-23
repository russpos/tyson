var _ = require('underscore');

/**
 * Constants
 *
 */
var IF_OPERATOR = {
    INT_EQUALS:     '-eq',
    INT_GT:         '-gt',
    STRING_EQUALS:  '=',
};

var FILE_PROPERTY = {
    MODE: "MODE",
    OWNER: "OWNER",
};

/**
 * toString
 *
 * Returns a safe, quoted, string that we can stick into an 
 * executable that you can use as a string literal
 *
 * @param string a The string you would like to escape and make a literal
 * @return string The quoted and escaped string
 */
var toString = function(a) {
    if (_.isString(a)) {
        return JSON.stringify(a);
    }
    throw new Error("toString currently only supports other strings");
};

/**
 * toVariable
 *
 * Returns a bash variable with the name given
 *
 * @param string varname The name of the variable you are using
 * @return string String of the variable name
 */
var toVariable = function(a) {
    return ('$' + a);
};

/**
 * Shell command templates
 */
var templates = {
    echo:              _.template("echo <%= content %>"),
    stat:              _.template("stat <%= path %>"),
    getFileProperties: _.template("<%= variable %>=`stat -c '<%= property %>' <%= path %>`"),
    iff:               _.template("if [ <%= left %> <%= operator %> <%= right %> ]"),
    assignRaw:         _.template("<%= variable %>=<% value %>"),
    assign_md5:        _.template("<%= variable %>=`cat <%= path %> | md5sum | cut -d' ' -f 1`"),

};

// Dialects are different variants of shell commands we'll need to support
// Right now, that's BSD and GNU
var DIALECTS = {};

DIALECTS.GNU = _.extend({}, templates);
DIALECTS.GNU.FILE_PROPERTY = {
    MODE:  '%a',
    OWNER: '%U',
    GROUP: '%G',
};

// Define BSD by overloading some things in GNU
DIALECTS.BSD = _.extend({}, templates, {
    getFileProperties: _.template("<%= variable %>=`stat -f '<%= property %>' <%= path %>`"),
});

DIALECTS.BSD.FILE_PROPERTY = {
    MODE:  '%OLp',
    OWNER: '%Su',
    GROUP: '%Sg',
};

var Context = function(hostdata) {
    this.output = [];
    this.hostdata = hostdata;

    this.templates = (hostdata.bsd) ? DIALECTS.BSD : DIALECTS.GNU;

    this.indentation = 0;
};

/**
 * __
 *
 * A "private" function helper.  Used to make the overall surface
 * area of the public API as slim as possible
 */
Context.prototype.__ = function(fn) {
    return fn.bind(this);
};

// TODO -- Context plugin framework
Context.prototype.assignFileProperty = function(property, variable, path) {
    var property = this.templates.FILE_PROPERTY[property];
    this.__(addLine)(this.templates.getFileProperties({
        variable: variable,
        property: property,
        path: path
    }));
};

var generateIndentation = function() {
    return (new Array(this.indentation+1)).join('    ');
};

var addLine = function(line) {
    this.output.push(this.__(generateIndentation)() + line);
    return this;
};

var dedent = function() {
    this.indentation--;
    if (this.indentation < 0) {
        this.indentation = 0;
    }
};

var indent = function() {
    this.indentation++;
};

var rawIf = function(a, b, operator, args) {

    // Then is the only required argument
    if (!args || !args.then || !_.isFunction(args.then)) {
        return;
    }

    // The 'as' argument is the context in which we will execute the 'then'
    // or 'lse' callbacks
    var context = args.as || this;

    // if [ .... ]
    this.__(addLine)(this.templates.iff({
        left: a,
        operator: operator,
        right: b,
    }));

    // then:
    this.__(addLine)('then');
    this.__(indent)();
        args.then.apply(context);
    this.__(dedent)();

    // else: ...
    if (args.lse && _.isFunction(args.lse)) {
        this.__(addLine)('else');
        this.__(indent)();
            args.lse.apply(context);
        this.__(dedent)();
    }

    // fi;
    this.__(addLine)('fi');
};

Context.prototype.echo = function(str) {
    this.__(addLine)(this.templates.echo({ content: toString(str) }));
};

Context.prototype.ifVarMatchesString = function(varName, stringValue, args) {
    this.__(rawIf)(
        toVariable(varName),
        toString(stringValue),
        IF_OPERATOR.STRING_EQUALS,
        args
    );
};

Context.prototype.assignFileMd5 = function(variable, path) {
    this.__(addLine)(this.templates.assign_md5({ variable: variable, path: path }));
};
Context.prototype.assignVariableRaw = function(variable, strValue) {
    this.__(addLine)(this.templates.assignRaw({ variable: variable, value: toString(strValue) }));
};


Context.prototype.generateOutput = function() {
    return this.output.join("\n");
};

Context.prototype.ifLastStatement = function(returnVal, args) {
    this.__(rawIf)(
        toVariable('?'),
        parseInt(returnVal, 10),
        IF_OPERATOR.INT_EQUALS,
        args
    );
};

Context.prototype.ifLastStatementSucceeded = function(args) {
    return this.ifLastStatement(0, args);
};

Context.prototype.ifLastStatementNonZero = function(args) {
    this.__(rawIf)(
        toVariable('?'),
        0,
        IF_OPERATOR.INT_GT,
        args
    );
};

Context.prototype.ifFileExists = function(path, args) {
    this.execRaw(this.templates.stat({ path: path }));
    this.ifLastStatementSucceeded(args);
};

Context.prototype.execRaw = function(rawSh, output) {
    if (!output) {
        rawSh += ' 2>&1> /dev/null';
    }
    this.__(addLine)(rawSh);
};

Context.prototype.noop = function() {
    return function() {
        this.__(addLine)(':');
    }.bind(this);
};

Context.prototype.chmod = function(path, perms) {
    this.execRaw('chmod -R ' + perms +' ' + path);
};

Context.prototype.chown = function(path, user, group) {
    this.execRaw('chown -R ' + user + ':' + group + ' ' + path);
};

Context.prototype.error = function(msg, code) {
    this.execRaw('>&2 echo ' + toString(msg), true);
    if (!code) {
        // @TODO - use real error codes that have 
        // known / defined meanings
        code = 5;
    }
    this.execRaw('return ' + code, true);
}

Context.prototype.writeFileContents = function(path, contents) {
    var eof = 'EOF' + Math.ceil(Math.random()*1000000);
    this.__(addLine)("cat << '" + eof + "' > " + path);
    this.output.push(contents);
    this.output.push(eof);
};

// Add the constant hashes to the main object so that we can
Context.IF_OPERATOR   = IF_OPERATOR;
Context.FILE_PROPERTY = FILE_PROPERTY;

// Create helper.  Doesn't really add a ton of value, I suppose
Context.create = function(hostdata) {
    return new Context(hostdata);
};

module.exports = Context;
