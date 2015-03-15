var File = require('./lib/File'),
    Service = require('./lib/Service'),
    Package = require('./lib/Package'),
    Bundle = require('./lib/Bundle'),
    ResourceIndex = require('./lib/ResourceIndex'),
    Executor = require('./lib/Executor');

    // This could use any templating language you want!
    template = function(opts) { return 'Hello world'; };

var Apache = Bundle(function(apacheOpts) {

    this.package = new Package({
        name: 'apache2',
        version: apacheOpts.version,
    });

    this.file = new File({
        path: '/etc/httpd/httpd.conf',
        contents: template(apacheOpts),
        dependsOn: [this.package],
    });

    this.service = new Service({
        name: 'httpd',
        dependsOn: [this.file, this.package]
    });
});


var apache = Apache({ title: 'Apache', version: '1.2.3.4' });

// TODO: Allow pasing bundles as extra arguments
var SiteA = Bundle(function(siteOpts) {

    this.site = new File({
        path: '/etc/httpd/sites-enabled/site-a.conf'
    });
    this.site.dependsOn(apache);
});

// Also support syntax where dependencies are passed into
// the bundle
var SiteB = Bundle(function(siteOpts, apacheInstance) {
    this.site = new File({
        path: '/etc/httpd/sites-enabled/site-a.conf'
    });
    this.site.dependsOn(apacheInstance);
});

var Host = Bundle(function(hostOpts) {
    this.siteA = SiteA({ title: 'SiteA' });
    this.siteB = SiteB({ title: 'SiteB' }, apache);
});


var host = Host({ title: 'web2', one: 2, two: 3 });

var order = Executor.orderDependenciesForObject(host);
var catalog = ResourceIndex.getCatalog();

var os = {
    sh: {
        run:  function(cmd) { console.log(">>>: " + cmd); return 0; },
        exec: function(cmd) { console.log(">>>: " + cmd); return 0; },
    },

    rm: function(path) { console.log(">>>: rm " + path); },
    link: function(src, dest) { console.log(">>>: ln -s " + src + ' ' + dest); },
    writeFile: function(path, contents) { console.log(">>>: cat $FILE > " + path); },
    chmod: function(path, perms) { console.log(">>>: chmod "+path+" "+perms); },
    chown: function(path, owner, group) { console.log(">>>: chown " + path); },
};

var hostInfo = { hostname: 'hello world' };
Executor.processQueue(order, ResourceIndex, os, hostInfo);
