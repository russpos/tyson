var execSync = require('exec-sync'),
    fs = require('fs');

return {

    exec: execSync,

    rm: function(path) {
        return fs.unlinkSync(path);
    },

    link: function(source, destination) {
        return fs.symlinkSync(source, destination);
    },

    chmod: function(path, mode) {
        return fs.chmodSync(path, mode);
    },

    writeFile: function(path, contents) {
        return fs.writeFileSync(path, contents);
    }
};
