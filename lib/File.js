var Resource = require('./Resource'),
    _ = require('underscore'),
    Logger = require('./Logger').namespace('File');

var File = Resource.createType('File', {
    permissions: 664,
    owner: 'root',
    group: 'root',
    path: '/tmp/file.txt',
    contents: 'Hello world'
});

File.prototype.exec = function(os, hostInfo) {
    Logger.debug(this.settings.path);
    var contents = this.settings.contents;

    // Check if contents is actually a template
    if (_.isFunction(contents)) {
        Logger.debug('Processing contents as a template');
    }

    // Write the file
    os.writeFile(this.settings.path,
                 this.settings.contents);

    // Set the permissions
    os.chmod(this.settings.path,
             this.settings.permissions);

    // Set the owners
    os.chown(this.settings.path,
             this.settings.owner,
             this.settings.group);
};

module.exports = File;
