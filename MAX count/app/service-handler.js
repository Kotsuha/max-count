"use strict";

const { __approot } = require("./common");
const { PATH, MESSAGE } = require(__approot + "/config/routes");

const echo = require(__approot + "/service/echo");
const {
	rivalRequest,
	cancelRivalRequest
} = require(__approot + "/service/rival-request");

const GET = {
	[PATH.ECHO]: (req, res) => echo.get(req, res),
};
const POST = {
	[PATH.ECHO]: (req, res) => echo.post(req, res),
};
const ON = {
	[MESSAGE.RIVAL_REQUEST]: (lr2id, socket) => rivalRequest(lr2id, socket),
	[MESSAGE.CANCEL_RIVAL_REQUEST]: (lr2id, socket) => cancelRivalRequest(lr2id, socket),
};

module.exports = {
	get: (path) => GET[path],
	post: (path) => POST[path],
	on: (message) => ON[message],
};
