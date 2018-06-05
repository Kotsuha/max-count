"use strict";

// https://stackoverflow.com/questions/12180790/defining-methods-via-prototype-vs-using-this-in-the-constructor-really-a-perfo
// https://stackoverflow.com/questions/10843572/how-to-create-javascript-constants-as-properties-of-objects-using-const-keyword
// https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/enum
// named constants
function Enumerator(value) {
	Object.defineProperty(this, "value", {
		value: value,
		enumerable: true // for console.log
	});
}
Enumerator.prototype.toString = function() {
	return this.value;
};

function Enumeration(obj) {
	for (let name in obj) {
		this[name] = new Enumerator(obj[name]);
	}
}

// const Enum = Enumeration;

module.exports = Enumeration;
