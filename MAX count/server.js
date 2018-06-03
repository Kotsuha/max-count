"use strict";

const { __rootdir, foon } = require("./common");
const CONFIG = require(__rootdir + "/config/config");

const http = require("http");

module.exports.run = function() {
	const server = http.createServer(function(request, response) {
		response.writeHead(200);
		response.end("Hello, World!");
	});

	server.listen(CONFIG.PORT, function() {
		foon.log(`http://localhost:${CONFIG.PORT}`);
	});
};
