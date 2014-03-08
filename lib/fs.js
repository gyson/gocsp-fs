
var go = require("gocsp");
var Channel = go.Channel;

var fs = require("fs");

// NOT SUPPORT:
// fs.write has callback(err, written, buffer)
// fs.read  has callback(err, bytesRead, buffer)
// fs.watchFile has listener(curr, prev)
// fs.unwatchFIle...
// fs.watch has listener(event, filename)
// fs.createReadStream...
// fs.createWriteStream...

[   "rename", "ftruncate", "truncate", "chrown",
    "fchown", "lchown", "chmod", "fchmod", "lchmod",
    "stat", "lstat", "fstat", "link", "symlink",
    "readlink", "realpath", "unlink", "rmdir", "mkdir",
    "readdir", "close", "open", "utimes", "futimes",
    "fsync", "readFile", "writeFile", "appendFile"
].forEach(function (property) {
    
    exports[property] = function () {
        var chan = new Channel();

        arguments[arguments.length] = function (err, data) {
            if (err)
                chan.throw(err);
            else
                chan.put(data);
        };

        arguments.length += 1;

        fs[property].apply(null, arguments);
        
        return chan;
    }
});

// callback without err
["exists"].forEach(function (property) {
    
    exports[property] = function () {
        var chan = new Channel();

        arguments[arguments.length] = function (arg) {
            chan.put(arg);
        };

        arguments.length += 1;

        fs[property].apply(null, arguments);
        
        return chan;
    }
});

exports.readJSON = function (path, options) {
    var chan = new Channel();

    fs.readFile(path, options, function (err, file) {    
        if (err) {
            chan.throw(err);
        } else {
            try { chan.put(JSON.parse(file)); } catch (e) { chan.throw(e); }
        }
    });

    return chan;
}

/*
    * filename {String}
    * value {Object}
    * options {Object}
        * encoding (for fs.writeFile)
        * mode     (for fs.writeFile)
        * flag     (for fs.writeFile)
        * replacer (for JSON.stringfy)
        * space    (for JSON.stringfy)
*/
exports.writeJSON = function (filename, value, options) {
    var chan = new Channel();

    try { 
        var json = JSON.stringify(value, options.replacer, options.space); 
    
        fs.writeFile(filename, json, options, function (err) {
            if (err) 
                chan.throw(err);
            else
                chan.put(undefined);
        });

    } catch (e) { chan.throw(e); }

    return chan;
}

// will ignore hiden files
exports.readDirRecursive = function (dir) {
    var chan = new Channel();
    walk(dir, function (err, results) {
        if (err) chan.throw(err);
        else {
            var dirlen = dir.length+1;
            for (var i = 0; i < results.length; i++) {
                results[i] = results[i].slice(dirlen);
            }
            chan.put(results);
        }
    });
    return chan;
}

exports.loadDirRecursive = function (dir, options) {    
    return go(function* () {
        var list = yield exports.readDirRecursive(dir);
        var chans = [];
        for (var i = 0; i < list.length; i++) {
            chans.push(exports.readFile(dir + "/" + list[i], options));
        }
        var dirlen = dir.length+1;
        var files = {};
        for (var i = 0; i < chans.length; i++) {
            files[list[i]] = (yield chans[i]).toString();
        }
        return files;
    });
}

// http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
function walk (dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            // ignore if it's hiden files
            if (file[0] === ".") {
                pending--;
                return;
            }

            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

// TODO: fs.copy & fs.move
// exports.copy = function (src, dst) {}
// exports.move = function (src, dst) {}

// TODO: how to handle fs.watch ?









