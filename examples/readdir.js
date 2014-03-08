
var go = require("gocsp");
var fs = require("gocsp-fs");

var path = require("path");

go(function* () {

	var dir = path.resolve(__dirname + "../../");

	console.log(dir);
	console.log(yield fs.readDirRecursive(dir));
	console.log(yield fs.loadDirRecursive(dir));
});



