Resource = require('./Resource');

var File = Resource.createType('File', {
    permissions: 664,
    owner: 'root',
    group: 'root',
    path: '/tmp/file.txt',
    contents: 'Hello world'
});

module.exports = File;
