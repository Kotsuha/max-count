"use strict";

const c0nsole = require("./c0nsole");

let isEnabled = true;
let prefix = "";
const foonPrefix = "(^^)";

function enable() {
	isEnabled = true;
}

function disable() {
	isEnabled = false;
}

function setPrefix(newPrefix) {
	prefix = newPrefix;
}

function setPrefixToFoon() {
	prefix = foonPrefix;
}

function log(...args) {
	if (!isEnabled) {
		return;
	}
	if (prefix !== "" && args.length > 0) {
		args.unshift(prefix);
	}
	c0nsole.log.apply(null, args);
}

module.exports = {
	enable: enable,
	disable: disable,
	setPrefix: setPrefix,
	setPrefixToFoon: setPrefixToFoon,
	log: log
};
