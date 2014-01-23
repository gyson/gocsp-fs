
var fs = require("../lib/fs.js");

var spawn = require("rejs-csp").spawn;

var assert = require("assert");

spawn(function* () {

	var path = __dirname + "/f1.txt";

	var result = yield* fs.writeFile(path, "hello");
	if (result instanceof Error) throw result;

	var data = yield* fs.readFile(path, "utf-8");
	if (data instanceof Error) throw data;
	
	assert(data === "hello");

	result = yield* fs.appendFile(path, ", world!");
	if (result instanceof Error) throw result;

	data = yield* fs.readFile(path, "utf-8");
	if (data instanceof Error) throw data;

	assert(data === "hello, world!");

	result = yield* fs.exists(path);
	assert(result === true);

	result = yield* fs.exists(path + "random");
	assert(result === false);

	console.log("Everything good!")

}());


