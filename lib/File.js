Resource = require('./Resource');

var File = Resource.createType('File', {
    permissions: 664,
    owner: 'root',
    group: 'root',
    path: '/tmp/file.txt',
    contents: 'Hello world'
});

File.prototype.exec = function(os) {
    os.writeFile(this.settings.path, this.settings.contents);
    os.chmod(this.settings.path, this.settings.permissions);
    // TODO: Chown
    // TODO Handle contents as a function
};

module.exports = File;
