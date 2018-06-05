"use strict";

const { __approot, foon } = require("./common");
const CONFIG = require(__approot + "/config/config");

module.exports.run = function() {
	const express = require("express");
	const app = express();
	const server = require("http").createServer(app);

	const prefix = "",
	      root = require("path").join(__approot, "public");
	app.use(prefix, express.static(root));

	server.listen(CONFIG.PORT, function() {
		foon.log(`http://localhost:${CONFIG.PORT}`);
	});
};
