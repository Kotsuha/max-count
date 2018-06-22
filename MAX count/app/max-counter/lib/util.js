"use strict";

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
}

module.exports = {
	MyList,
	SongRanking
};
