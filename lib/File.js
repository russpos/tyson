var Resource = require('./Resource'),
    _ = require('underscore'),
    Logger = require('./Logger').namespace('File'),
    md5 = require('./md5');

/**
 * Map of constants that can be used as the ensure
 * argument to settings
 */
var ENSURE = {
    EXISTS: 1,
    REMOVED: 2,
};

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

    // Basic file settings
    permissions: 0664,
    owner: 'root',
    group: 'root',

    // Path where the file will be written
    path: '/tmp/file.txt',

    // Contents of the outputed file. Can be a template (function) 
    // or a string.
    contents: 'Hello world',

    // If contents is a function, we assume it's a template (and will
    // return a string.) templateData will be provided as the context
    // for this template.
    templateData: {},

    // We can either ensure a file exists, or that a file
    // is removed.
    ensure: ENSURE.EXISTS,

});

/**
 * Checks the MD5 of the current file on disk and compares it to the
 * MD5 of the new file contents.  If the file does not exist or if it's
 * contents do not match, update the file.
 *
 * @param SystemTools os SystemTools to use for fs access
 * @return bool True if contents changed, false if not
 */
var updateFileContents = function(os) {
    var contents = this.settings.contents;

    // Check if contents is actually a template
    if (_.isFunction(contents)) {
        Logger.debug('Processing contents as a template');
        contents = contents(this.settings.templateData);
    }

    // Check if old file exists and verify checksum
    var checksum = -1;
    try {
        var oldContents = os.readFile(this.settings.path);
        checksum = md5(oldContents);
    } catch (e) {
        Logger.warn(e);
        Logger.debug(this.settings.path + ' does not exist yet');
    }

    // If checksum of file contents has changed, write it
    if (checksum == md5(contents)) {

        // Write the file
        os.writeFile(this.settings.path, contents);
        return true;
    }
    return false;
};

/**
 * Called as a method on a File resource. This will determine if 
 * the files ownership needs to be updated, and if so, update it.
 *
 * Returns TRUE if ownership changed, FALSE if it stayed the same.
 *
 * @param SystemTools os SystemTools to use for fs access
 * @return bool True if ownership changed, false if not
 */
var updateFileOwnership = function(os) {
    var fileStats = os.fileStats(this.settings.path);
    var ownership = os.convertUserAndGroupToId(this.settings.owner,
                                               this.settings.group);

    if (ownership[0] !== fileStats.uid || ownership[1] !== fileStats.gid) {
        Logger.debug("Changing ownership " + this.settings.path);
        // Set the owners
        os.chown(this.settings.path,
                ownership[0],
                ownership[1]);
        return true;
    }
    return false;
};

/**
 * Ensure the file exists to the provided settings on the host
 *
 * @param SystemTools os SystemTools to use for fs access
 * @param Object hostInfo Extra configuration data about the host*
 * @return Bool Returns true if any change occurs 
*/
var ensureExists = function(os, hostInfo) {
    var contentsChanged = false,
        ownerChanged = false,
        permissionsChanged = false;

    contentsChanged = updateFileContents.apply(this, [os]);
    ownerChanged = updateFileOwnership.apply(this, [os]);

    // TODO -- Check the permissions first

    os.chmod(this.settings.path,
        this.settings.permissions);

    // TODO: Add change event for when files change
    return (contentsChanged || ownerChanged || permissionsChanged);
};

/**
 * Ensure the file is removed from the host.
 *
 * @param SystemTools os SystemTools to use for fs access
 * @param Object hostInfo Extra configuration data about the host*
 * @return Bool Returns true if any change occurs 
*/
var ensureRemoved = function(os, hostInfo) {
    // TODO
    return false;
};

/**
 * Applies file changes to the system.  Ensures file
 * exists (or does not exist) and meets defined spec.
 *
 * @param SystemTools os SystemTools to use for fs access
 * @param Object hostInfo Extra configuration data about the host
 * @return Bool Returns true if any change occurs 
 */
File.prototype.exec = function(os, hostInfo) {
    Logger.debug(this.settings.path);

    if (this.settings.ensure == ENSURE.REMOVED) {
        return ensureRemoved.apply(this, arguments);
    } else if (this.settings.ensure == ENSURE.EXISTS) {
        return ensureExists.apply(this, arguments);
    }


};

File.ENSURE = ENSURE;

module.exports = File;
