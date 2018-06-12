"use strict";

function MaxInfo(bmsid, title, score, ranking) {
	this.bmsid = bmsid;
	this.title = title;
	this.score = score;
	this.ranking = ranking;
}

MaxInfo.prototype.toString = function() {
	return `[${this.bmsid}] ${this.title} ${this.score} ${this.ranking}`;
};

MaxInfo.createFromEntries = function(playDataEntry, rankingEntry) {
	const bmsid = playDataEntry.bmsid,
		  title = playDataEntry.title,
		  score = rankingEntry.score,
		  ranking = playDataEntry.ranking;
	return new MaxInfo(bmsid, title, score, ranking);
};

module.exports = MaxInfo;
