var Resource = require('./Resource'),
    _ = require('underscore'),
    Logger = require('./Logger').namespace('File');

var File = Resource.createType('File', {
    permissions: 664,
    owner: 'root',
    group: 'root',
    path: '/tmp/file.txt',
    templateData: {},
    contents: 'Hello world'
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
