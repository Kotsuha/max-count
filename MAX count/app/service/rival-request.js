"use strict";

const { __approot, foon } = require("../common");
const { GOAL } = require(__approot + "/config/config");
const MaxCountChecker = require(__approot + "/max-count-checker");
const lr2ir = require("app/lr2ir");
const { MESSAGE } = require(__approot + "/config/routes");

const tasks = {};

const MSG = {
	ALREADY_CHECKING: (lr2id) => `Already checking ${lr2id}`,
	WILL_RIVAL: (lr2id) => `Will rival ${lr2id}`,
	WILL_NOT_RIVAL: (lr2id) => `Will not rival ${lr2id}`,
	NOT_ENOUGH_MAX: "Not enough max records",
	RIVAL_DONE: (lr2id) => `Done rivaling ${lr2id}. Please check.`,
};

const rivalRequest = function(lr2id, socket) {

	const log = function(message) {
		foon.log(message);
		socket.emit(MESSAGE.LOG, message);
	};

	if (tasks.hasOwnProperty(lr2id)) {
		log(MSG.ALREADY_CHECKING(lr2id));
		return;
	}

	const logTotal = function(maxInfos) {
		log("");
		for (let i = 0, length = maxInfos.length; i < length; i++) {
			log(`${i+1}. ${maxInfos[i]}`);
		}
		log("Total: " + maxInfos.length);
		log("");
	};

	log(`Start checking ${lr2id}`);
	const checker = new MaxCountChecker(lr2id, GOAL, log);
	const promise = checker.check()
		.then((maxInfos) => {
			logTotal(maxInfos);
			if (maxInfos.length < GOAL) {
				log(MSG.WILL_NOT_RIVAL(lr2id));
				return Promise.reject(MSG.NOT_ENOUGH_MAX);
			}
			log(MSG.WILL_RIVAL(lr2id));
			return lr2ir.addRival(lr2id);
		})
		.then(() => {
			log(MSG.RIVAL_DONE(lr2id));
		})
		.catch((err) => {
			log(err);
		})
		.finally(() => {
			delete tasks[lr2id];
			log("over"); // TODO
		});

	tasks[lr2id] = {
		promise,
		socket
	};
};

const cancelRivalRequest = function(lr2id, socket) {
	if (tasks.hasOwnProperty(lr2id) === false || tasks[lr2id].socket !== socket) {
		return;
	}
	tasks[lr2id].promise.cancel();
	delete tasks[lr2id];
};

module.exports = {
	rivalRequest,
	cancelRivalRequest,
};
