"use strict";

const MaxCountChecker = require("./max-count-checker");
const logger = require("app/logger");

const LR2ID = "";
const GOAL = 100;

logger.setPrefixToFoon();
const mcc = new MaxCountChecker(LR2ID, GOAL, logger.log);
let p = mcc.check()
	.then(function(maxInfos) {
		logger.log("----------");
		for (let i = 0, length = maxInfos.length; i < length; i++) {
			logger.log(`${i+1}. ${maxInfos[i]}`);
		}
		logger.log("Total: " + maxInfos.length);
	})
	.catch(function(err) {
		logger.log(err);
	});
