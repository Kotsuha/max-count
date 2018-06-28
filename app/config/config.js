"use strict";

const config = {
	GOAL: 100,
	MAX_USERS: 3,
	PORT: process.env.PORT || 3000,	// TODO?
	LR2ID: process.env.LR2ID,		// TODO?
	PASSWORD: process.env.PASSWORD,	// TODO?
};

module.exports = Object.freeze(config);
