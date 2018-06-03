"use strict";

const { __rootdir, args, foon } = require("./common");
const lr2ir = require(__rootdir + "/libs/lr2ir");
const server = require(__rootdir + "/server");

function loginOrNot() {
	return args.length === 2 
		? lr2ir.setUser(args[0], args[1]).login() 
		: Promise.resolve();
}

loginOrNot()
.then(() => { 
	foon.log("LR2IR logged in", lr2ir.getUserCensored());
	server.run();
});
