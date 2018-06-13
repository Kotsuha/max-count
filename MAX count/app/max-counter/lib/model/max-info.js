"use strict";

function MaxInfo(bmsid, title, ranking, player, playerid, score) {
	this.bmsid = bmsid;
	this.title = title;
	this.ranking = ranking;
	this.player = player;
	this.playerid = playerid;
	this.score = score;
}

MaxInfo.prototype.toString = function() {
	return `[${this.bmsid}] ${this.title} ${this.ranking} ${this.player} ${this.playerid} ${this.score}`;
};

// MaxInfo.createFromEntries = function(playDataEntry, rankingEntry) {
// 	const bmsid = playDataEntry.bmsid,
// 		  title = playDataEntry.title,
// 		  score = rankingEntry.score,
// 		  ranking = playDataEntry.ranking;
// 	return new MaxInfo(bmsid, title, score, ranking);
// };

module.exports = MaxInfo;
