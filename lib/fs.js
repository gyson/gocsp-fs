
var fs = require("fs");

// NOT SUPPORT:
// fs.write has callback(err, written)
// fs.read  has callback(err, bytesRead)
// fs.watchFile has listener(curr, prev) // object observer
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
].forEach(function (method) {
    var fn = fs[method]
    exports[method] = function () {
        var args = [].slice.call(arguments)
        return function (resolve, reject) {
            args.push(function (err, data) {
                err ? reject(err) : resolve(data)
            });
            fn.apply(null, args);
        }
    }
});

// callback without err
["exists"].forEach(function (method) {
    var fn = fs[method]
    exports[method] = function () {
        var args = [].slice.call(arguments)
        return function (resolve, reject) {
            args.push(function (arg) {
                resolve(arg)
            })
            fn.apply(null, args)
        }
    }
});


exports.readJSON = function (path, options) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, options, function (err, file) {
            try {
                resolve(JSON.parse(file.toString()))
            } catch (err) {
                reject(err)
            }
        })
    })
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
    return new Promise(function (resolve, reject) {
        var json = JSON.stringify(value, options.replacer, options.space);
        fs.writeFile(filename, json, options, function (err) {
            err ? reject(err) : resolve()
        });
    })
}

// will ignore hiden files
exports.readDirRecursive = function (dir) {
    return new Promise(function (resolve, reject) {
        walk(dir, function (err, results) {
            if (err) {
                reject(err)
            } else {
                var dirlen = dir.length + 1;
                for (var i = 0; i < results.length; i++) {
                    results[i] = results[i].slice(dirlen);
                }
                resolve(results);
            }
        })
    })
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
    })();
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

            file = dir + '/' + file; // use path module!
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
