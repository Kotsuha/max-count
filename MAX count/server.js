"use strict";

const { __rootdir, foon } = require("./common");
const CONFIG = require(__rootdir + "/config/config");

const http = require("http");
const express = require("express");

module.exports.run = function() {
	const app = express();
	const server = http.createServer(app);

	const prefix = "",
	      root = require("path").join(__rootdir, "public");
	app.use(prefix, express.static(root));

	server.listen(CONFIG.PORT, function() {
		foon.log(`http://localhost:${CONFIG.PORT}`);
	});
};
