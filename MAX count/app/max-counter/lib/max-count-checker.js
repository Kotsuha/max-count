"use strict";

const lr2ir = require("app/lr2ir");
const { MyList, SongRanking } = require("./util");
const MaxInfo = require("./model/max-info");
const wait = require("app/wait").dottedWait;
const oopsRetry = require("app/oops-retry");

const Promise = require("bluebird");
Promise.config({
	// Enable cancellation
	cancellation: true,
});
const bluebird = Promise.resolve;


const WAIT_MS = {
	REQUEST: 3000,
	RETRY: 10000,
};

const OOPS_NUM = {
	RETRY: 2
};

const MaxCountChecker = function(lr2id, goal, report) {

	// act as the last check result
	this.maxInfos = [];
	this.push = function(maxInfo) {
		this.maxInfos.push(maxInfo);
	};
	this.empty = function() {
		this.maxInfos.length = 0;
	};
	this.isPassed = () => this.maxInfos.length >= goal;

	this.checkMyList = (page) => bluebird()
		.then(( ) => lr2ir.openMyList(lr2id, "clear", page))
		.then(($) => {
			this.empty();
			const pdEntries = MyList.getPlayDataEntries($);
			

			const collectMaxUntilPassed = (entry) => {
				if (this.isPassed()) {
					return Promise.resolve();
				}

				report("Check " + entry.toString());
				return this.autoRetry.checkSongRanking(entry.bmsid, "1")
					.then((maxInfo) => {
						if (maxInfo === undefined) return;
						this.push(maxInfo);
						report(maxInfo.score + " -> MAX: " + this.maxInfos.length + "\n");
					})
					.then(() => wait(WAIT_MS.REQUEST))
					.catch((err) => Promise.reject(err));
			};

			return Promise
				.each(pdEntries, collectMaxUntilPassed)
				.then(() => this.maxInfos)
				.catch((err) => Promise.reject(err));
		})
		.catch((err) => Promise.reject(err))
		.finally(() => report(this.maxInfos));

	this.checkSongRanking = (bmsid, page) => bluebird()
		.then(( ) => lr2ir.openSongRanking(bmsid, page))
		.then(($) => {
			let maxInfo;
			const rEntries = SongRanking.getRankingEntries($);
			for (const entry of rEntries) {
				if (entry.isYou(lr2id) && entry.isMax()) {
					const title = SongRanking.getSongTitle($);
					const {ranking, player, playerid, score} = entry;
					maxInfo = new MaxInfo(bmsid, title, ranking, player, playerid, score);
					break;
				}
			}
			return maxInfo;
		})
		.catch((err) => Promise.reject(err));

	this.autoRetry = {};
	this.autoRetry.checkSongRanking = oopsRetry(
		this.checkSongRanking, OOPS_NUM.RETRY, WAIT_MS.RETRY);
};


module.exports = MaxCountChecker;


const logger = require("app/logger");
const mcc = new MaxCountChecker("100746", 15, logger.log);
let p = mcc.checkMyList(1)
// mcc.checkSongRanking.autoRetry(10, 1)
	.then(function(mi) {
		logger.log(mi);
	})
	.catch(function(err) {
		logger.log(err);
	});

wait(60000, "-")
	.then(() => {
		logger.log("cancel()");
		p.cancel();
	});
