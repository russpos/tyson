var exec = require('exec-sync'),
    Logger = require('./Logger').namespace('os'),
    util = require('util'),
    fs = require('fs');

var userMap = {},
    groupMap = {};

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

    convertUserAndGroupToId: function(owner, group) {
        if (userMap[owner] && groupMap[group]) {
            return [userMap[owner], groupMap[group]];
        }

        // TODO: Use a subprocess and exec-sync, don't do this

        var d = new Date(),
            fileName = '/tmp/tyson-'+d.valueOf();
        this.writeFile(fileName, d.valueOf().toString);
        try {
            exec('chown -R '+owner+':'+group+' '+fileName);
        } catch (e) {
            Logger.error(e);
            throw new Error("Encountered error while accessing uid/guid",
                            owner,
                            group);
        }

        var stats = this.fileStats(fileName);

        // Now that we have stats on this file, cache it and save
        userMap[owner] = stats.uid;
        userMap[group] = stats.guid;
        return [stats.uid, stats.gid];
    },

    chown: function(path, uid, guid) {
        return fs.chownSync(path, uid, guid);
    },

    fileStats: function(file) {
        return fs.statSync(file);
    },

    writeFile: function(path, contents) {
        return fs.writeFileSync(path, contents);
    },

    readFile: function(path) {
        return fs.readFileSync(path).toString();
    }
};
