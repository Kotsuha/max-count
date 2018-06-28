"use strict";

const { __approot, foon } = require("app/__global");
const CONFIG = require(__approot + "/config/config");
const router = require(__approot + "/router");

module.exports.run = function() {
	const express = require("express");
	const app = express();
	const server = require("http").createServer(app);

	const prefix = "",
	      root = require("path").join(__approot, "public");
	app.use(prefix, express.static(root));

	const io = require("socket.io")(server);

	router.setUp({app, io});

	server.listen(CONFIG.PORT, function() {
		foon.log(`Listening on ${CONFIG.PORT}`);
	});
};
