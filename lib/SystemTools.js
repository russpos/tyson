var execSync = require('exec-sync'),
    fs = require('fs');

return {

    sh: execSync,

    rm: function(path) {
        return fs.unlinkSync(path);
    },

    link: function(source, destination) {
        return fs.symlinkSync(source, destination);
    },

    chmod: function(path, mode) {
        return fs.chmodSync(path, mode);
    },

    chown: function(path, owner, group) {
        return fs.chownSync(path, owner, group);
    },

    writeFile: function(path, contents) {
        return fs.writeFileSync(path, contents);
    }
};
