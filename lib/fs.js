
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

