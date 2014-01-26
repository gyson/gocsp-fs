
var Channel = require("rejs-csp").Channel;

var fs = require("fs");

["readFile", "stat", "readlink", "realpath", "readdir"].forEach(function (property) {
    
    exports[property] = function* () {
        var chan = new Channel();

        arguments[arguments.length] = function (err, data) {
            chan.send(err || data);
        };

        arguments.length += 1;

        fs[property].apply(null, arguments);
        
        return yield chan;
    }
});

["writeFile", "appendFile", "exists"].forEach(function (property) {
    
    exports[property] = function* () {
        var chan = new Channel();

        arguments[arguments.length] = function (arg) {
            chan.send(arg);
        };

        arguments.length += 1;

        fs[property].apply(null, arguments);
        
        return yield chan;
    }
});

exports.readJSON = function* (path) {
    var chan = new Channel();

    fs.readFile(path, "utf-8", function (err, file) {
        
        if (err) chan.send(err);

        try { chan.send(JSON.parse(file)); } catch (e) { chan.send(e); }
    });

    return yield chan;
}

exports.writeJSON = function* (path, value, replacer, space) {

    try { 
        var json = JSON.stringify(value, replacer, space); 
    } catch (e) { return e; }

    var chan = new Channel();

    fs.writeFile(path, json, function (err) { chan.send(err); });

    return yield chan;
}

