"use strict";

const Promise = require("bluebird");
const bluebird = Promise.resolve;
Promise.config({
	cancellation: true,
});

const lr2ir = require("app/lr2ir");
const { MyList, SongRanking } = require("./util");

const { FC, TOP } = require("./const/badge");
const MaxInfo = require("./model/max-info");
const makeOopsRetryFn = require("app/oops-retry");
const wait = require("app/wait").dottedWait;



const WAIT = {
	REQUEST: 3000,
	RETRY: 30000,
};
const OOPS = 3;

const retryOpenMyList = makeOopsRetryFn(lr2ir.openMyList, OOPS, WAIT.RETRY);
const retryOpenSongRanking = makeOopsRetryFn(lr2ir.openSongRanking, OOPS, WAIT.RETRY);


const MaxCountChecker = function(lr2id, goal, log) {

	const isNoMorePM = (pdEntry) => pdEntry.isFC() === false;
	const isPassed = (maxInfos) => maxInfos.length >= goal;

	this.config = function(obj) {
		if (obj.hasOwnProperty("top")) filters[TOP].enabled = obj.top;
		return this;
	};

	const filters = {
		[FC]: {
			enabled: true,
			check: (pdEntry) => pdEntry.isFC()
		},
		[TOP]: {
			enabled: true,
			check: (pdEntry) => pdEntry.isTop()
		}
	};

	const isPM = function(pdEntry) {
		for (const type in filters) {
			const filter = filters[type];
			if (filter.enabled && filter.check(pdEntry) === false) {
				return false;
			}
		}
		return true;
	};


	this.check = function() {
		const maxInfos = [];

		const checkRecursively = (page = 1) => bluebird()
			.then(() => this.checkMyList(page, maxInfos))
			.then(([maxInfos, nextPage, noMorePM]) => {
				const noMorePage = (nextPage === undefined);
				if (isPassed(maxInfos) || noMorePM || noMorePage) {
					return maxInfos;
				}
				return checkRecursively(nextPage);
			})
			.catch(Promise.reject);

		return checkRecursively();
	};

	this.checkMyList = function(page, maxInfos = []) {
		return bluebird()
			.then(() => retryOpenMyList(lr2id, "clear", page))
			.then(($) => {
				let noMorePM = false;
				const nextPage = MyList.getNextPage($);

				if (nextPage === undefined) {
					log("No more プレイデータ pages");
				}

				const pdEntries = MyList.getPlayDataEntries($);
				const checkPDEntry = (pdEntry) => {

					if (isPassed(maxInfos) || noMorePM) {
						return Promise.resolve();
					}
					if (isPM(pdEntry) === false) {
						if (noMorePM === false && isNoMorePM(pdEntry)) {
							noMorePM = true;
							log(`No more PM songs: ${pdEntry}`);
							return Promise.resolve();
						}
					}

					log("Check " + pdEntry.toString());
					return this.checkSongRanking(pdEntry.bmsid, "1")
						.then((maxInfo) => {
							if (maxInfo === undefined) return;
							maxInfos.push(maxInfo);
							log(maxInfo.score + " -> MAX: " + maxInfos.length + "\n");
						})
						.then(() => wait(WAIT.REQUEST))
						.catch(Promise.reject);
				};

				return Promise
					.each(pdEntries, checkPDEntry)
					.then(() => [maxInfos, nextPage, noMorePM])
					.catch(Promise.reject);
			})
			.catch(Promise.reject);
	};

	this.checkSongRanking = function(bmsid, page) {
		return bluebird()
			.then(() => retryOpenSongRanking(bmsid, page))
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
			.catch(Promise.reject);
	};
};


module.exports = MaxCountChecker;
