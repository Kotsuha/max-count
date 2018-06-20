"use strict";

const lr2ir = require("app/lr2ir");
const MaxInfo = require("./model/max-info");
const { MyList, SongRanking } = require("./util");
const oopsRetry = require("app/oops-retry");
const Promise = require("bluebird");
const wait = require("app/wait").dottedWait;

const WAIT_MS = {
	REQUEST: 3000,
	RETRY: 10000,
};
const OOPS_NUM = {
	RETRY: 2
};

const MaxCountChecker = function(lr2id, goal, report) {

	this.checkMyList = (page) => lr2ir.openMyList(lr2id, "clear", page)
		.then(($) => {
			const maxInfos = [];
			const pdEntries = MyList.getPlayDataEntries($);
			const isPassed = () => maxInfos.length >= goal;

			const collectMaxUntilPassed = (entry) => {
				if (isPassed()) {
					return Promise.resolve();
				}

				report("Check " + entry.toString());
				return this.autoRetry.checkSongRanking(entry.bmsid, "1")
					.then((maxInfo) => {
						if (maxInfo === undefined) return;
						maxInfos.push(maxInfo);
						report(maxInfo.score + " -> MAX: " + maxInfos.length + "\n");
					})
					.then(() => wait(WAIT_MS.REQUEST))
					.catch((err) => Promise.reject(err));
			};

			return Promise
				.each(pdEntries, collectMaxUntilPassed)
				.then(() => maxInfos)
				.catch((err) => Promise.reject(err));
		})
		.catch(function(err) {
			return Promise.reject(err);
		});

	this.checkSongRanking = (bmsid, page) => lr2ir.openSongRanking(bmsid, page)
		.then(function($) {
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
		.catch(function(err) {
			return Promise.reject(err);
		});

	this.autoRetry = {};
	this.autoRetry.checkSongRanking = oopsRetry(
		this.checkSongRanking, OOPS_NUM.RETRY, WAIT_MS.RETRY);
};

module.exports = MaxCountChecker;
