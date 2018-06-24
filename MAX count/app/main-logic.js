"use strict";

const { __approot, args, foon } = require("app/__global");
const lr2ir = require("app/lr2ir");
const server = require(__approot + "/server");

function loginOrNot() {
	return args.length === 2 
		? lr2ir.setUser(args[0], args[1]).login().then(() => {
			foon.log("LR2IR logged in", lr2ir.getUserCensored());
		})
		: Promise.resolve();
}

loginOrNot()
	.then(() => { 
		server.run();
	});
