"use strict";

const echo = {
	get: function(req, res) {
		const reqQuery = req.query;
		res.send(reqQuery);
	},
	post: function(req, res) {
		const reqBody = req.body;
		res.send(reqBody);
	}
};

module.exports = echo;
