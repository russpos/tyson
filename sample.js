var Bundle = require('./lib/Bundle'),
    Executor = require('./lib/Executor'),
    File = require('./lib/File'),
    Package = require('./lib/Package'),
    Service = require('./lib/Service'),
    _ = require('underscore'),
    fs = require('fs');

// Create a bundle for Nginx
// Bundles are a collection of tangible resources
// In the case of Nginx, the tangible resources here are:
//  * The package, which we want to ensure is installed
//  * A configuration file, which we want to include
//  * And a service, which we want to ensure is running and
//  also reload if anything changes in this run
var Nginx = Bundle(function(NginxOpts) {

    this.package = new Package({
        name: 'nginx',
        version: NginxOpts.version,
    });

    this.file = new File({
        path: '/etc/nginx/nginx.conf',
        contents: fs.readFileSync(__dirname + '/global_nginx.conf'),
        dependsOn: [this.package],
    });

    this.service = new Service({
        name: 'nginx',
        dependsOn: [this.file, this.package]
    });
});


// Create a bundle for a static Nginx site
// Here, this bundle only has one resource -- a single configuration
// file that we will install baed on how we iniitalize this bundle
//
// This bundle depends on Nginx, so you can see that we're expecting
// an Nginx instance when we actually create the bundle instance for 
// this static site.
//
// We're going to use a template to create this file so you can easily
// add different variables for each instance, or perhpas though different
// configurations.
var staticSiteConf = fs.readFileSync(__dirname + '/site.conf').toString();
var StaticSite = Bundle(function(siteOpts, nginxInstance) {

    this.site = new File({
        path: '/etc/nginx/sites-enabled/' + siteOpts.configName + '.conf',
        contents: _.template(staticSiteConf),
        templateData: siteOpts
    });
    this.site.dependsOn(nginxInstance);
});


// OK. Now let's configure a simple web host.
// We don't really have the concept of Hosts / Roles, etc.
// Instead, we just bundle things. This host will bundle 2
// StaticSites 
var Web = Bundle(function(hostOpts) {
    // Create an instance of Nginx
    this.nginx = Nginx({ version: '1.1.19-1ubuntu0.7' });

    this.siteA = StaticSite({
        port: 8000,
        server_name: hostOpts.name,
        configName: 'site-a',
        webroot: '/var/www'
    }, this.nginx);

    this.siteB = StaticSite({
        port: 9000,
        server_name: hostOpts.altName,
        configName: 'site-b',
        webroot: '/var/www'
    }, this.nginx);
});


// Create a host and provision it
var host = Web({
    name: 'mysite.com',
    altName: 'static.mysite.com',
});


// Provision the host.
// Provide any extra data here.  This could be useful for production / development
// configs, etc.
var extraData = {};

Executor.provision(host, extraData);
