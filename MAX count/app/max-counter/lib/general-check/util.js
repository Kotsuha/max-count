"use strict";

const Promise = require("bluebird");
const lr2ir = require("app/lr2ir");
const { 
	PlayDataEntry, 
	RankingEntry 
} = require("./model/entry");


class MyList {
	static getPlayDataTable($) {
		return $("table").first();
	}

	static getPlayDataEntries($) {
		const $table = this.getPlayDataTable($);
		const $rows = $table.find("tr")
		                    .not(":has('th')"); // no header row
		const entries = [];
		$rows.each((i, el) => {
			const $row = $(el);
			const entry = PlayDataEntry.createFromRow($row);
			entries.push(entry);
		});
		return entries;
	}

	static requestPlayDataEntries(playerid, page) {
		return Promise.resolve()
			.then(() => lr2ir.openMyList(playerid, "clear", page))
			.then(($) => MyList.getPlayDataEntries($))
			.catch((err) => Promise.reject(err));
	}
}


class SongRanking {
	static getRankingTable($) {
		return $("table").eq(3); // 0 情報 1-2 総合ステータス 3 ランキング
	}

	static getRankingEntries($) {
		const $table = this.getRankingTable($);
		const $rows = $table.find("tr")
		                    .not(":has('th')")
		                    .not(":has('[colspan]')"); // no comment rows
		const entries = [];
		$rows.each((i, el) => {
			const $row = $(el);
			const entry = RankingEntry.createFromRow($row);
			entries.push(entry);
		});
		return entries;
	}

	static requestRankingEntries(bmsid, page) {
		return Promise.resolve()
			.then(() => lr2ir.openSongRanking(bmsid, page))
			.then(($) => this.getRankingEntries($))
			.catch((err) => Promise.reject(err));
	}
}

module.exports = {
	MyList,
	SongRanking
};
