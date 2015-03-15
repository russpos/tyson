var Resource = require('./Resource'),
    _ = require('underscore'),
    Logger = require('./Logger').namespace('File');

/**
 * File is the most straight-forward resource.
 *
 * When you provision a file resource, we ensure that
 * a file either exists (or does NOT exist) at a given path.
 *
 * When you ensure a file exists, it will also ensure
 * it has the correct contents, ownership, and permissions.
 */
var File = Resource.createType('File', {
    permissions: 664,
    owner: 'root',
    group: 'root',

    // Path where the file will be written
    path: '/tmp/file.txt',

    // Contents of the outputed file. Can be a function.
    contents: 'Hello world',

    // If contents is a function, we assume it's a template (and will
    // return a string.) templateData will be provided as the context
    // for this template.
    templateData: {},

});

File.prototype.exec = function(os, hostInfo) {
    Logger.debug(this.settings.path);
    var contents = this.settings.contents;

    // Check if contents is actually a template
    if (_.isFunction(contents)) {
        Logger.debug('Processing contents as a template');
        contents = contents(this.settings.templateData);

    }

    // Write the file
    os.writeFile(this.settings.path, contents);

    // Set the permissions
    os.chmod(this.settings.path,
             this.settings.permissions);

    // Set the owners
    /* TODO -- Convert use / group to UID * GUID
    os.chown(this.settings.path,
             this.settings.owner,
             this.settings.group);
    */
};

module.exports = File;
