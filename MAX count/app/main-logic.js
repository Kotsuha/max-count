"use strict";

const { __rootdir, args, foon } = require("./common");
const lr2ir = require("libs/lr2ir");
const server = require(__rootdir + "/server");

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
