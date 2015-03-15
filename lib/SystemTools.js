var exec = require('exec-sync'),
    Logger = require('./Logger').namespace('os'),
    fs = require('fs');

module.exports = {

    exec: function(cmd, args) {
        Logger.info(cmd + ' ' + args.join(' '));
        return exec(cmd + ' '+ args.join(' '));
    },

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
