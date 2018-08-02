"use strict";

const { __approot } = require("app/__global");
const { MAX_USERS } = require(__approot + "/config/config");

const users = (function() {
	let current = 0;
	// const isMaxReached = () => current >= MAX_USERS;
	const change = function(num) {
		const newUsers = current + num;
		if (newUsers > MAX_USERS || newUsers < 0 || newUsers === current) {
			return false;
		}
		onUsersChange(newUsers);
		if (current === 0 && newUsers > 0) {
			onUsersBecomeGreaterThanZero(newUsers);
		} else if (current > 0 && newUsers === 0) {
			onUsersBecomeZero(newUsers);
		}
		current = newUsers;
		return true;
	};
	const createEvent = require("app/event");
	const onUsersChange = createEvent();
	const onUsersBecomeGreaterThanZero = createEvent();
	const onUsersBecomeZero            = createEvent();
	const increase = () => change(+1);
	const decrease = () => change(-1);
	const toString = () => `${current}/${MAX_USERS}`;
	return {
		// isMaxReached,
		increase,
		decrease,
		onUsersChange,
		onUsersBecomeGreaterThanZero,
		onUsersBecomeZero,
		toString,
	};
}());

module.exports = users;
