"use strict";

/**
 * Represents a record of the ○○のプレイデータ table
 *
 * @class      PlayDataEntry playDataEntry
 * @param      {string}  no       1 2 3 ... 100
 * @param      {string}  title    タイトル
 * @param      {string}  bmsid    bmsid
 * @param      {string}  clear    クリア
 * @param      {string}  ranking  ランキング
 */
function PlayDataEntry(no, title, bmsid, clear, ranking) {
	this.no = no;
	this.title = title;
	this.bmsid = bmsid;
	this.clear = clear;
	// this.playCount = playCount;
	this.ranking = ranking;
}

PlayDataEntry.prototype.toString = function() {
	return `${this.no} ${this.title} [${this.bmsid}] ${this.clear} ${this.ranking}`;
};


/**
 * Represents a record of the ランキング table
 *
 * @class      RankingEntry rankingEntry
 * @param      {string}  player    プレイヤー
 * @param      {string}  playerid  playerid
 * @param      {string}  score     スコア
 */
function RankingEntry(ranking, player, playerid, score) {
	this.ranking = ranking;
	this.player = player;
	this.playerid = playerid;
	// this.dan = dan;
	// this.clear = clear;
	// this.rank = rank;
	this.score = score;
	// this.combo = combo;
	// ...
	// this.comment = comment;
}

RankingEntry.prototype.toString = function() {
	return `${this.player} [${this.playerid}] ${this.score}`;
};


// Some common functions

function isFC(clear) {
	return clear.indexOf("FULLCOMBO") !== -1;
}

function isTop(ranking) {
	return ranking.indexOf("1/") === 0 || ranking === "1"; // for both mylist and ranking
}

function isMax(score) {
	return score.indexOf("(100%)") !== -1;
}

function isYou(id1, id2) {
	return id1 === id2; // TODO: 有要支援 1 和 000001 的差別嗎?
}


// Add methods

function addMethods(Fn) {
	const obj = new Fn();
	if (obj.hasOwnProperty("clear"))    Fn.prototype.isFC = function() { return isFC(this.clear); };
	if (obj.hasOwnProperty("ranking"))  Fn.prototype.isTop = function() { return isTop(this.ranking); };
	if (obj.hasOwnProperty("score"))    Fn.prototype.isMax = function() { return isMax(this.score); };
	if (obj.hasOwnProperty("playerid")) Fn.prototype.isYou = function(id) { return isYou(this.playerid, id); };
}

addMethods(PlayDataEntry);
addMethods(RankingEntry);


// Add things related to $

const querystring = require("querystring");

PlayDataEntry.createFromRow = function($row, $) {
	const $cells = $row.find("td");

	// 找出正確的 cell
	// const $noCell = $cells.eq(0),
	//       $titleCell = $cells.eq(1),
	//       $clearCell = $cells.eq(2),
	//       $rankingCell = $cells.eq(4);
	// 因為這裡會根據玩家設定，有的欄位可能會不顯示，例如 "プレイ回数" 可以隱藏，所以不能直接抓第幾格
	const $noCell      = $cells.eq(0);
	const $titleCell   = $cells.filter((i, el) => $(el).text().indexOf("タイトル") !== -1).first();
	const $clearCell   = $cells.filter(function(i, el) {
		const text = $(el).text();
		const b = text.indexOf("クリア") !== -1;
		return b;
	}).first();
	const $rankingCell = $cells.filter((i, el) => $(el).text().indexOf("ランキング") !== -1).first();
	
	const no = $noCell.text(),
	      title = $titleCell.text(),
	      href = $titleCell.find("a").first().prop("href"),
	      bmsid = querystring.parse(href).bmsid,
	      clear = $clearCell.text(),
	      ranking = $rankingCell.text();
	const entry = new PlayDataEntry(no, title, bmsid, clear, ranking);
	return entry;
};

RankingEntry.createFromRow = function($dataRow /*, $commentRow*/) {
	const $cells = $dataRow.find("td");
	const $rankingCell = $cells.eq(0),
	      $playerCell = $cells.eq(1),
	      $scoreCell = $cells.eq(5);
	const ranking = $rankingCell.text(),
	      player = $playerCell.text(),
	      href = $playerCell.find("a").first().prop("href"),
	      playerid = querystring.parse(href).playerid,
	      score = $scoreCell.text();
	const entry = new RankingEntry(ranking, player, playerid, score);
	return entry;
};


// We're done

module.exports = {
	PlayDataEntry,
	RankingEntry
};
