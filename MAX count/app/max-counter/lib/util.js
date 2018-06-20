"use strict";

const Promise = require("bluebird");
const lr2ir = require("app/lr2ir");
const { 
	PlayDataEntry, 
	RankingEntry 
} = require("./model/entry");
const querystring = require("querystring");


// TODO DRY
class MyList {
	static getPlayDataTable($) {
		return $("table").first();
	}

	static getPlayDataRows($) {
		const $table = this.getPlayDataTable($);
		const $rows = $table.find("tr")
		                    .not(":has('th')"); // no header row
		return $rows;
	}

	static getPlayDataEntries($) {
		const $rows = this.getPlayDataRows($);
		const entries = [];
		$rows.each((i, el) => {
			const $row = $(el);
			const entry = PlayDataEntry.createFromRow($row);
			entries.push(entry);
		});
		return entries;
	}

	// TODO: XXXXX remove the jsDoc comment
	/**
	 * Convert $rows to an array of PlayDataEntry.
	 *
	 * @param      {<type>}    $rows     The rows
	 * @param      {Function}  $         The cheerio $.
	 * @param      {Function}  callback  Works as a filter and a stopping point
	 *                                   indicator. Leave it for no filtering.
	 * @return     {Array}     The play data entries.
	 */
	// static forEachPlayDataEntry($rows, callback) {

	// }

	// static convertToPlayDataEntries($rows, $, callback = (o) => o) {
	// 	const entries = [];
	// 	$rows.each((i, el) => {
	// 		const $row = $(el);
	// 		const entry = PlayDataEntry.createFromRow($row);

	// 		const o = callback(entry);
	// 		if (o === entry) {
	// 			entries.push(entry);
	// 		} else {
	// 			return o;
	// 		}
	// 	});
	// 	return entries;
	// }

	// static requestPlayDataEntries(playerid, page) {
	// 	return Promise.resolve()
	// 		.then(() => lr2ir.openMyList(playerid, "clear", page))
	// 		.then(($) => MyList.getPlayDataEntries($))
	// 		.catch((err) => Promise.reject(err));
	// }
	
	static getNextPage($) {
		const $a = $("a");
		let nextPage;
		$a.each((i, el) => {
			const $el = $(el);
			const text = $el.text();
			const href = $el.prop("href");
			const { mode, page } = querystring.parse(href);
			if (text === ">>" && mode === "mylist") {
				nextPage = page;
				return false;
			}
		});
		return nextPage;
	}
}


class SongRanking {
	static getSongTitle($) {
		return $("h1").first().text();
	}

	static getRankingTable($) {
		return $("table").eq(3); // 0 情報 1-2 総合ステータス 3 ランキング
	}

	static getRankingRows($) {
		const $table = this.getRankingTable($);
		const $rows = $table.find("tr")
		                    .not(":has('th')")
		                    .not(":has('[colspan]')"); // no comment rows
		return $rows;
	}

	static getRankingEntries($) {
		const $rows = this.getRankingRows($);
		const entries = [];
		$rows.each((i, el) => {
			const $row = $(el);
			const entry = RankingEntry.createFromRow($row);
			entries.push(entry);
		});
		return entries;
	}

	// static convertToRankingEntries($rows, $, callback = (o) => o) {
	// 	const entries = [];
	// 	$rows.each((i, el) => {
	// 		const $row = $(el);
	// 		const entry = RankingEntry.createFromRow($row);

	// 		const o = callback(entry);
	// 		if (o === entry) {
	// 			entries.push(entry);
	// 		} else {
	// 			return o;
	// 		}
	// 	});
	// 	return entries;
	// }

	// static requestRankingEntries(bmsid, page) {
	// 	return Promise.resolve()
	// 		.then(() => lr2ir.openSongRanking(bmsid, page))
	// 		.then(($) => this.getRankingEntries($))
	// 		.catch((err) => Promise.reject(err));
	// }
}

module.exports = {
	MyList,
	SongRanking
};
