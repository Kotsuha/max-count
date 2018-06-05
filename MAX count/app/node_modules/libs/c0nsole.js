"use strict";

function C0nsole() {
	this.log = function(...args) {
		console.log.apply(console, args);
	};
}

const c0nsole = new C0nsole();

module.exports = c0nsole;
