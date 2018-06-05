"use strict";

const { __rootdir, foon } = require("./common");
const CONFIG = require(__rootdir + "/config/config");

module.exports.run = function() {
	const express = require("express");
	const app = express();
	const server = require("http").createServer(app);

	const prefix = "",
	      root = require("path").join(__rootdir, "public");
	app.use(prefix, express.static(root));

	server.listen(CONFIG.PORT, function() {
		foon.log(`http://localhost:${CONFIG.PORT}`);
	});
};
