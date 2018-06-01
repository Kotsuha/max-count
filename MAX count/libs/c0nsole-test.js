"use strict";

const c0nsole = require("./c0nsole");

let boolArray = [true, false];
let numArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
let strArray = ["foo", "bar", "baz", "qux", "quux"];
let objArray = [
	{},
	{
		activeSelf: true,
		name: "Button",
		isStatic: false,
		tag: "Untagged",
		layer: 5,
		transform: {
			position: {
				x: 0,
				y: 0,
				z: 0
			}
		}
	}
];

function randomFrom(arr) {
	// https://stackoverflow.com/questions/5915096/get-random-item-from-javascript-array
	return arr[Math.floor(Math.random() * arr.length)];
}

const bool = randomFrom(boolArray);
const num = randomFrom(numArray);
const str = randomFrom(strArray);
const obj = randomFrom(objArray);

function runCase(fn) {
	console.log("Case:");
	fn();
	console.log();
}

runCase(function() {
	console.log();
	c0nsole.log();
});

runCase(function() {
	console.log(bool);
	c0nsole.log(bool);
});

runCase(function() {
	console.log(num);
	c0nsole.log(num);
});

runCase(function() {
	console.log(str);
	c0nsole.log(str);
});

runCase(function() {
	console.log(obj);
	c0nsole.log(obj);
});

runCase(function() {
	console.log(bool, num, str, obj);
	c0nsole.log(bool, num, str, obj);
});

runCase(function() {
	console.log(!bool, num+1, str+"!");
	c0nsole.log(!bool, num+1, str+"!");
});

runCase(function() {
	const Foo = function(baz) {
		this.bar = function() {
			console.log(this);
			c0nsole.log(this);
		};
		this.baz = baz;
	};
	let foo = new Foo("baz...");
	foo.bar();
});
