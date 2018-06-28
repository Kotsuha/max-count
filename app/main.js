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

loginOrNot()
	.then(() => { 
		server.run();
	});
