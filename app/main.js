"use strict";

const { __approot, args, foon } = require("app/__global");
const CONFIG = require(__approot + "/config/config");
const lr2ir = require("app/lr2ir");
const server = require(__approot + "/server");

function loginOrNot() {
	const lr2id = args[0] || CONFIG.LR2ID;
	const password = args[1] || CONFIG.PASSWORD;

	return (lr2id && password) 
		? lr2ir.setUser(lr2id, password).login().then(() => {
			foon.log("LR2IR logged in", lr2ir.getUserCensored());
		})
		: Promise.resolve();
}

// heroku-waker
function wakeHerokuOrNot() {
	const url = CONFIG.APP_URL;
	const interval = CONFIG.WAKE_INTERVAL;
	if (url && interval) {
		const waker = require("app/heroku-waker");
		waker.setUrl(url).setInterval(interval);
		const users = require(__approot + "/users");
		users.onUsersBecomeGreaterThanZero.add(waker.start);
		users.onUsersBecomeZero.add(waker.stop);
		foon.log("Will try to keep heroku awake", url, interval);
	}
}

loginOrNot()
	.then(() => {
		wakeHerokuOrNot();
		server.run();
	});
