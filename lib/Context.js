var _ = require('underscore');

var IF_OPERATOR = {

    INT_EQUALS: '-eq', 
    INT_GT: '-gt',
    STRING_EQUALS: '='

};

var toString = function(a) {
    return JSON.stringify(a);
};

var toVariable = function(a) {
    return ('$' + a);
};

var templates = {
    echo:              _.template("echo <%= content %>"),
    stat:              _.template("stat <%= path %> > /dev/null"),
    getFileProperties: _.template("<%= variable %>=`stat -c '<%= property %>' <%= path %>`"),
    iff:               _.template("if [ <%= a %> <%= operator %> <%= b %> ]"),
    then:              _.template("then"),
    assignRaw:         _.template("<%= variable %>=<% value %>"),
    assign_md5:        _.template("<%= variable %>=`cat <%= path %> | md5sum | cut -d' ' -f 1`"),
};

var Context = function(hostdata) {
    this.output = [];
    this.indentation = 0;
};

// TODO -- Context plugin framework
Context.prototype.assignFileProperty = function(property, variable, path) {
    this.addLine(templates.getFileProperties({
        variable: variable,
        property: property,
        path: path
    }));
};

Context.prototype.generateIndentation = function() {
    return (new Array(this.indentation+1)).join('  ');
};

Context.prototype.addLine = function(line) {
    this.output.push(this.generateIndentation() + line);
    return this;
};

Context.prototype.echo = function(str) {
    this.addLine(templates.echo({ content: toString(str) }));
};

Context.prototype.ifVarMatchesString = function(varName, stringValue, args) {
    this.rawIf(
        toVariable(varName),
        toString(stringValue),
        IF_OPERATOR.STRING_EQUALS,
        args
    );
};


Context.prototype.rawIf = function(a, b, operator, args) {
    if (!args || !args.then || !_.isFunction(args.then)) {
        return;
    }

    var context = args.as || this;

    this.addLine(templates.iff({
        a: a,
        b: b,
        operator: operator
    })).addLine(templates.then());

    this.indent();
    args.then.apply(context);
    this.dedent();
    if (args.lse && _.isFunction(args.lse)) {
        this.addLine('else');
        this.indent();
        args.lse.apply(context);
        this.dedent();
    }
    this.addLine('fi');
};

Context.prototype.indent = function() {
    this.indentation++;
};

Context.prototype.assignFileMd5 = function(variable, path) {
    this.addLine(templates.assign_md5({ variable: variable, path: path }));
};
Context.prototype.assignVariableRaw = function(variable, strValue) {
    this.addLine(templates.assignRaw({ variable: variable, value: toString(strValue) }));
};

Context.prototype.dedent = function() {
    this.indentation--;
    if (this.indentation < 0) {
        this.indentation = 0;
    }
};

Context.FILE_PROPERTY = {
    MODE: '%a',
    OWNER: '%U',
};

Context.prototype.generateOutput = function() {
    return this.output.join("\n");
};

Context.create = function(hostdata) {
    return new Context(hostdata);
};

Context.prototype.ifLastStatement = function(returnVal, args) {
    this.rawIf(
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
    this.rawIf(
        toVariable('?'),
        0,
        IF_OPERATOR.INT_GT,
        args
    );
};

Context.prototype.ifFileExists = function(path, args) {
    this.execRaw(templates.stat({ path: path }));
    this.ifLastStatementSucceeded(args);
};

Context.prototype.execRaw = function(rawSh) {
    this.addLine(rawSh + ' > /dev/null');
};
Context.prototype.noop = function() {
    return function() {
        this.addLine(':');
    }.bind(this);
};

Context.prototype.chmod = function(path, perms) {
    this.execRaw('chmod -R ' + perms +' ' + path);
};

Context.prototype.chown = function(path, user, group) {
    this.execRaw('chown -R ' + user + ':' + group + ' ' + path);
};

Context.prototype.error = function(msg, code) {
    this.execRaw('>&2 echo ' + toString(msg));
    if (!code) {
        code = 127;
    }
    this.execRaw('return ' + code);
}

Context.prototype.writeFileContents = function(path, contents) {
    var eof = 'EOF' + Math.ceil(Math.random()*1000000);
    this.addLine("cat << '" + eof + "' > " + path);
    this.output.push(contents);
    this.output.push(eof);
};
/*
var c = new Context({});
c.assignFileProperty(Context.FILE_PROPERTY.OWNER, 'user',  "/etc/nginx/sites-enabled/site-b.conf");
c.assignFileProperty(Context.FILE_PROPERTY.MODE,  'perms', "/etc/nginx/sites-enabled/site-b.conf");
c.ifVarMatchesString('user', 'www-data', {
    then: function() {
        c.echo("hello world!");
    },
    lse: function() {
        c.echo("they \"don't\" match none, son.");
    }
});
c.execRaw("apt-get install -y nodejs");
c.ifLastStatementSucceeded({
    then: function() {
        c.echo(">>> it's alllllll gooooooooood");
    }
});
c.ifFileExists('/var/foo/bar', {
    then: function() {
        c.echo('Foo exists');
    },
    lse: function() {
        c.echo('foo not here');
    }
});

c.ifFileExists('/var/log', {
    then: function() {
        c.echo('var log exists');
    },
    lse: function() {
        c.echo('var log not here');
    }
});
console.log(c.generateOutput());
*/
module.exports = Context;
