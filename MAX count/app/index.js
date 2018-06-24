"use strict";

const foon = require("app/logger");
foon.setPrefixToFoon();
foon.log("Start");

const __global = require("app/__global");
__global.__approot = __dirname;
__global.args = process.argv.slice(2);
__global.foon = foon;

require("./main-logic");
