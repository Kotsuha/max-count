"use strict";

const { __approot } = require("./common");
const { PATH, MESSAGE } = require(__approot + "/config/routes");
const { MAX_USERS } = require(__approot + "/config/config");

const echo = require(__approot + "/service/echo");
const {
	rivalRequest,
	cancelRivalRequest
} = require(__approot + "/service/rival-request");



let io;
const init = function(newIo) {
	io = newIo;
};

const MSG = {
	MAX_USERS_REACHED: "Sorry, MAX_USERS reached."
};

let curr_users = 0;
const changeUsers = function(num) {
	const new_users = curr_users + num;
	if (new_users > MAX_USERS || new_users < 0) {
		return false;
	}
	curr_users += num;
	emitUsers(io);
	return true;
};
const emitUsers = function(who) {
	who.emit(MESSAGE.USERS, currUsersString());
};
const increaseUsers = () => changeUsers(+1);
const decreaseUsers = () => changeUsers(-1);
const currUsersString = () => `${curr_users}/${MAX_USERS}`;



const GET = {
	[PATH.ECHO]: (req, res) => echo.get(req, res),
};

const POST = {
	[PATH.ECHO]: (req, res) => echo.post(req, res),
};

const ON = {
	[MESSAGE.CONNECTION]: (socket) => {
		emitUsers(socket);
	},
	[MESSAGE.RIVAL_REQUEST]: (lr2id, socket) => {
		const changed = increaseUsers();
		if (!changed) {
			socket.emit(MESSAGE.LOG, MSG.MAX_USERS_REACHED);
			return;
		}
		rivalRequest(lr2id, socket, function() {
			decreaseUsers();
		});
	},
	[MESSAGE.CANCEL_RIVAL_REQUEST]: (lr2id, socket) => {
		cancelRivalRequest(lr2id, socket);
	},
};

module.exports = {
	init,
	get: (path) => GET[path],
	post: (path) => POST[path],
	on: (message) => ON[message],
};
