var Context = require('../lib/Context');

var c = new Context({ bsd: true });

c.assignFileProperty(Context.FILE_PROPERTY.OWNER,
                     'user',
                     "/etc/nginx/sites-enabled/site-b.conf"
                    );

c.assignFileProperty(Context.FILE_PROPERTY.MODE,
                     'perms',
                     "/etc/nginx/sites-enabled/site-b.conf"
                    );

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
    },
    lse: function() {
        c.echo("Could not install that package");
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


