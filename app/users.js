"use strict";

const { __approot } = require("app/__global");
const { MAX_USERS } = require(__approot + "/config/config");

const users = (function() {
	let curUsers = 0;
	const change = function(num) {
		const oldUsers = curUsers;
		const newUsers = oldUsers + num;
		if (newUsers > MAX_USERS || newUsers < 0 || newUsers === oldUsers) {
			return false;
		}
		curUsers = newUsers;
		onUsersChange(curUsers);
		if (oldUsers === 0 && curUsers > 0) {
			onUsersBecomeGreaterThanZero(curUsers);
		} else if (oldUsers > 0 && curUsers === 0) {
			onUsersBecomeZero(curUsers);
		}
		return true;
	};
	const createEvent = require("app/event");
	const onUsersChange = createEvent();
	const onUsersBecomeGreaterThanZero = createEvent();
	const onUsersBecomeZero            = createEvent();
	const increase = () => change(+1);
	const decrease = () => change(-1);
	const toString = () => `${curUsers}/${MAX_USERS}`;
	return {
		increase,
		decrease,
		onUsersChange,
		onUsersBecomeGreaterThanZero,
		onUsersBecomeZero,
		toString,
	};
}());

module.exports = users;
