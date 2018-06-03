"use strict";

const lr2ir = require("./lr2ir");
const foon = require("./logger");
const Promise = require("bluebird");



const createRivalCase = function(id, expect, comment) {
	return {
		id: id,
		expect: expect,
		comment: comment,
		toString: function() {
			return `${this.id}, "${this.comment}", 預期: ${this.expect}`;
		}
	};
};

const createRivalCaseArr = function(arr) {
	arr.getIds = function() {
		let ids = [];
		for (let i = 0; i < this.length; i++) {
			ids.push(this[i].id);
		}
		return ids;
	}
	return arr;
};


////////// ↓↓ Please provide data ↓↓ //////////

// A valid account
const you = {
	id: "",
	password: ""
};

// For testing rival addition
const addRivalCases = createRivalCaseArr([
	createRivalCase("1", true, "normal player"),
	createRivalCase("2", true, "normal player"),
	createRivalCase("3", true, "normal player"),
	createRivalCase("5", false, "pitch black -> account deleted?"),
	createRivalCase("7", false, "pitch black -> account deleted?"),
	createRivalCase("", false, "エラーが発生しました -> no id"),
	createRivalCase("0", false, "エラーが発生しました -> illegal id"),
	createRivalCase("3.14", false, "pitch black -> illegal id"), // It will fail, but you'll see an interesting thing
	createRivalCase("hoge", false, "エラーが発生しました -> illegal id"),
	createRivalCase(you.id, false, "you"),
	createRivalCase("143999", true, "有効でないLR2IDです"),
	createRivalCase("200000", false, "pitch black -> 未来人"),
]);

// For testing rival deletion
const deleteRivalCases = createRivalCaseArr([
	createRivalCase("2", true, "normal player"),
	createRivalCase("3", true, "normal player"),
	createRivalCase("5", true, "pitch black -> account deleted?"),
	createRivalCase("0", true, "エラーが発生しました -> illegal id"),
	createRivalCase("143999", true, "有効でないLR2IDです"),
]);

////////// ↑↑ Please provide data ↑↑ //////////


const delayCountDown = function(sec) {
	sec = parseInt(sec);
	let arr = [];
	arr.push(() => console.log());
	for (let i = sec; i > 0; i--) {
		const j = i;
		arr.push(function() {
			process.stdout.write("\x1b[K");
			for (let i = 1; i < j; i++) {
				process.stdout.write(".");
			}
			process.stdout.write("\r");
			return Promise.delay(1000);
		});
	}
	return Promise.each(arr, (fn) => fn());
}

foon.setPrefixToFoon();


Promise.resolve(true)
.then(function() {
	let fakeYou = Object.assign({}, you);
	fakeYou.password += fakeYou.password;

	return Promise.resolve(true)
	.then(() => {
		foon.log("預期: 登入失敗", fakeYou);
		return lr2ir.login(fakeYou.id, fakeYou.password);
	})
	.then(() => foon.log("登入成功", fakeYou))
	.catch((err) => foon.log(err));
})
.then(() => delayCountDown(5))
.then(function() {
	return Promise.resolve(true)
	.then(() => {
		foon.log("預期: 登入成功", you);
		return lr2ir.login(you.id, you.password);
	})
	.then(($) => {
		foon.log("登入成功", you);
		foon.log("預期: 看到已登入後才會顯示的字樣");
		foon.log($("#user").text());
	})
	.catch((err) => foon.log(err));
})
.then(() => delayCountDown(10))
.then(function() {
	return Promise.resolve(true)
	.then(() => {
		foon.log("對以下 ID 測試加 rival");
		foon.log(addRivalCases.getIds());
		foon.log("快去打開 you 的マイページ");
	})
	.then(() => delayCountDown(10))
	.then(() => {
		return Promise.each(addRivalCases, function(rivalCase) {
			return Promise.resolve(true)
			.then(() => {
				foon.log(rivalCase.toString());
				return lr2ir.addRival(rivalCase.id);
			})
			.then(() => {
				foon.log("加 rival 成功，快去檢查");
			})
			.catch((err) => {
				foon.log(err);
				foon.log("加 rival 失敗");
			})
			.finally(() => delayCountDown(10));
		});
	});
})
.then(() => delayCountDown(5))
.then(function() {
	return Promise.resolve(true)
	.then(() => {
		foon.log("對以下 ID 測試刪 rival");
		foon.log(deleteRivalCases.getIds());
	})
	.then(() => delayCountDown(5))
	.then(() => {
		return Promise.each(deleteRivalCases, function(rivalCase) {
			return Promise.resolve(true)
			.then(() => {
				foon.log(rivalCase.toString());
				return lr2ir.deleteRival(rivalCase.id);
			})
			.then(() => {
				foon.log("刪 rival 成功，快去檢查");
			})
			.catch((err) => {
				foon.log(err);
				foon.log("刪 rival 失敗");
			})
			.finally(() => delayCountDown(10));
		});
	});
})
.then(() => delayCountDown(2))
.finally(function() {
	foon.log("測試結束");
});
