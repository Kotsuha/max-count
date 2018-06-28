"use strict";

const Enum = require("app/enum");

const BADGE = new Enum({
	FC: "FULLCOMBO",
	// PA: "★",
	TOP: "1/",
	MAX: "(100%)"
});

module.exports = Object.freeze(BADGE);
