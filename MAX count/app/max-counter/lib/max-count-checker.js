"use strict";

const lr2ir = require("app/lr2ir");
const { MyList, SongRanking } = require("./util");
const MaxInfo = require("./model/max-info");
const makeAutoRetryFn = require("app/oops-retry");
const wait = require("app/wait").dottedWait;

const Promise = require("bluebird");
const bluebird = Promise.resolve;
Promise.config({
	cancellation: true, // Enable cancellation
});


const WAIT = {
	REQUEST: 3000,
	RETRY: 10000,
};

const OOPS = {
	RETRY: 2
};

const MaxCountChecker = function(lr2id, goal, report) {

	this.checkMyList = function(page) {
		const maxInfos = [];
		const isPassed = () => maxInfos.length >= goal;
		return bluebird()
			.then(( ) => lr2ir.openMyList(lr2id, "clear", page))
			.then(($) => {
				const pdEntries = MyList.getPlayDataEntries($);
				const collectMaxInfosUntilPassed = (pdEntry) => {
					if (isPassed()) {
						return Promise.resolve();
					}
					report("Check " + pdEntry.toString());
					return this.autoRetry.checkSongRanking(pdEntry.bmsid, "1")
						.then((maxInfo) => {
							if (maxInfo === undefined) return;
							maxInfos.push(maxInfo);
							report(maxInfo.score + " -> MAX: " + maxInfos.length + "\n");
						})
						.then(() => wait(WAIT.REQUEST))
						.catch((err) => Promise.reject(err));
				};
				return Promise
					.each(pdEntries, collectMaxInfosUntilPassed)
					.then(() => maxInfos)
					.catch((err) => Promise.reject(err));
			})
			.catch((err) => Promise.reject(err))
			.finally(() => report(maxInfos));
	};

	this.checkSongRanking = function(bmsid, page) {
		return bluebird()
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
	};

	this.autoRetry = {};
	this.autoRetry.checkSongRanking = makeAutoRetryFn(
		this.checkSongRanking, 
		OOPS.RETRY, 
		WAIT.RETRY
	);
};


module.exports = MaxCountChecker;
