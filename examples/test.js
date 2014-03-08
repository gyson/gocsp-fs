
var fs = require("../lib/fs.js");

var go = require("gocsp");

var assert = require("assert");

go(function* () {

	var path = __dirname + "/f1.txt";

	yield fs.writeFile(path, "hello");

	var data = yield fs.readFile("xxx" + path, "utf-8");
	

	result = yield fs.appendFile(path, ", world!");
	
	data = yield fs.readFile(path, "utf-8");
	
	assert(data === "hello, world!");

	result = yield fs.exists(path);
	assert(result === true);

	result = yield fs.exists(path + "random");
	assert(result === false);

	console.log("Everything good!")

});


