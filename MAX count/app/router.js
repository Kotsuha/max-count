"use strict";

const { __approot } = require("app/__global");
const { PATH, MESSAGE } = require(__approot + "/config/routes");
const sh = require(__approot + "/service-handler");

module.exports.setUp = function({app, io}) {

	const bodyParser = require("body-parser");
	// app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded // For html form
	app.use(bodyParser.json()); // parse application/json // For testing post raw json in Chrome

	app.get(
		PATH.ECHO,
		(req, res) => sh.get(PATH.ECHO)(req, res));

	app.post(
		PATH.ECHO,
		(req, res) => sh.post(PATH.ECHO)(req, res));

	sh.init(io);
	io.on(MESSAGE.CONNECTION, function(socket) {
		sh.on(MESSAGE.CONNECTION)(socket);
		// socket.on(MESSAGE.DISCONNECT, function() {});
		socket.on(
			MESSAGE.RIVAL_REQUEST,
			(lr2id) => sh.on(MESSAGE.RIVAL_REQUEST)(lr2id, socket));
		socket.on(
			MESSAGE.CANCEL_RIVAL_REQUEST,
			(lr2id) => sh.on(MESSAGE.CANCEL_RIVAL_REQUEST)(lr2id, socket));
	});
};
