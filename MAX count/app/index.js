"use strict";

const foon = require("app/logger");
foon.setPrefixToFoon();
foon.log("Start");

const common = require("./common");
common.__approot = __dirname;
common.args = process.argv.slice(2);
common.foon = foon;

require("./main-logic");
