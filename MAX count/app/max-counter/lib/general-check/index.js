"use strict";

const lr2ir = require("app/lr2ir");
const { 
	MyList, 
	SongRanking 
} = require("app/lr2ir-abstr").view;

function checkSongRanking(bmsid, page, filter) {
	return lr2ir.openSongRanking(bmsid, page)
		.then(($) => {
			const entries = SongRanking.getRankingEntries($);
			return filter(entries);
		})
		.catch((err) => Promise.reject(err));
}

function checkMyList(playerid, page, filter) { // TODO dry
	return lr2ir.openMyList(playerid, page)
		.then(($) => {
			const entries = MyList.getPlayDataEntries($);
			return filter(entries);
		})
		.catch((err) => Promise.reject(err));
}

module.exports = {
	checkMyList,
	checkSongRanking,
};
