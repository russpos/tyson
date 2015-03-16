var exec = require('exec-sync'),
    Logger = require('./Logger').namespace('os'),
    fs = require('fs');

/**
 * A collection of tools that serve as a bridge between application
 * code and the OS.
 *
 * Helps to hide the implementation details of these functions as well
 * as allow for easier testing.
 */
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

    // TODO: Convert to uid and guid and use fs.chownSync
    chown: function(path, owner, group) {
        return exec('chown -R '+owner+':'+group+' '+path);
    },

    writeFile: function(path, contents) {
        return fs.writeFileSync(path, contents);
    },

    readFile: function(path) {
        return fs.readFileSync(path).toString();
    }
};
