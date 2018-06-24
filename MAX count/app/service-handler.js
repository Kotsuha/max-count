"use strict";

const { __approot } = require("app/__global");
const { PATH, MESSAGE } = require(__approot + "/config/routes");
const { MAX_USERS } = require(__approot + "/config/config");

const users = (function() {
	let current = 0;
	// const isMaxReached = () => current >= MAX_USERS;
	const change = function(num) {
		const newUsers = current + num;
		if (newUsers > MAX_USERS || newUsers < 0) {
			return false;
		}
		current = newUsers;
		onUsersChange(current);
		return true;
	};
	const createEvent = require("app/event");
	const onUsersChange = createEvent();
	const increase = () => change(+1);
	const decrease = () => change(-1);
	const toString = () => `${current}/${MAX_USERS}`;
	return {
		// isMaxReached,
		increase,
		decrease,
		onUsersChange,
		toString,
	};
}());

let io;
const setIO = function(newIO) {
	io = newIO;
};
const emitUsers = function(who) {
	who.emit(MESSAGE.USERS, users.toString());
};
users.onUsersChange.add(() => emitUsers(io));


const echo = require(__approot + "/service/echo");
const { rivalRequest, cancelRivalRequest } = require(__approot + "/service/rival-request");


const GET = {
	[PATH.ECHO]: (req, res) => echo.get(req, res),
};

const POST = {
	[PATH.ECHO]: (req, res) => echo.post(req, res),
};

const ON = {
	[MESSAGE.CONNECTION]: function(socket) {
		emitUsers(socket);
	},
	[MESSAGE.RIVAL_REQUEST]: (lr2id, socket) => {
		const changed = users.increase();
		if (!changed) {
			socket.emit(MESSAGE.LOG, MSG.MAX_USERS_REACHED);
			return;
		}
		rivalRequest(lr2id, socket, function() {
			users.decrease();
		});
	},
	[MESSAGE.CANCEL_RIVAL_REQUEST]: (lr2id, socket) => {
		cancelRivalRequest(lr2id, socket);
	},
};

const MSG = {
	MAX_USERS_REACHED: "Sorry, MAX_USERS reached."
};



module.exports = {
	setIO,
	get: (path) => GET[path],
	post: (path) => POST[path],
	on: (message) => ON[message],
};
