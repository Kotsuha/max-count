"use strict";

const rp = require("request-promise");
const iconv = require("iconv-lite");
const cheerio = require("cheerio");
const querystring = require("querystring");

const URL = {
	PROTOCOL: "http",
	HOST: "www.dream-pro.info",
	PATH: [
		"~lavalse",
		"LR2IR",
		"search.cgi"
	]
};

const baseUrl = (function createBaseUrl() {
	const { PROTOCOL, HOST, PATH } = URL;
	return `${PROTOCOL}://${HOST}/${PATH[0]}/${PATH[1]}/${PATH[2]}`;
})();


const cookieJar = rp.jar();

const getCookie = function() {
	const { HOST, PATH } = URL;
	const host = HOST,
		  path = "/" + PATH[0] + "/" + PATH[1];
	let value = 
		cookieJar._jar.store.idx[host] 
	 && cookieJar._jar.store.idx[host][path];
	let cookie = value || null;
	return cookie;
};

const isExpired = function() {
	let result;
	const cookie = getCookie();

	if (cookie === null) {
		result = true;
	}
	else {
		const expires = cookie.login.expires; // 只要這個格式是 Date.parse() 吃的，應該就沒事
		let timeNow = Date.now(),
			timeExp = Date.parse(expires);
		result = (timeNow >= timeExp);
	}
	if (result) console.log("isExpired() 結果:", result); // TODO
	return result;
};


const myPage = new (function MyPage() { // TODO
	this.name = "マイページ";
	this.getRivalIds = function($) { // static
		const $selfIntroTable = $("table").first(); // プレイヤーステータス table
		const $rivalRow = $("tr", $selfIntroTable).filter((i, el) => $("th", el).text() === "ライバル");
		let ids = [];
		$("a", $rivalRow).each(function(i, el) {
			const href = $(el).prop("href");
			const playerid = querystring.parse(href).playerid;
			ids.push(playerid);
		});
		return ids;
	};
})();

const SERVICE = {
	LOGIN: "ログイン",
	ADD_RIVAL: "ライバルリストに追加",
	DELETE_RIVAL: "ライバルリストから削除"
};
const { LOGIN, ADD_RIVAL, DELETE_RIVAL } = SERVICE;


const UNSUCCESSFUL = {};
UNSUCCESSFUL[LOGIN] = "Failed to login. Maybe ID or password is wrong."; // "[エラー]不正なIDです" "[エラー]パスワードが違います" ...
UNSUCCESSFUL[ADD_RIVAL] = "Failed to add rival.";
UNSUCCESSFUL[DELETE_RIVAL] = "Failed to delete rival.";

const { request, confirm, requestAndConfirm } = (function() {
	
	const commonOptions = {
		method: "POST",
		uri: baseUrl,
		jar: cookieJar,
		encoding: null,
		transform: function(body) {
			body = iconv.decode(body, "Shift_JIS");
			return cheerio.load(body, { decodeEntities: false });
		}
	};

	let request = {};

	request[LOGIN] = function(lr2id, password) {
		return rp(Object.assign({
			form: { lr2id: lr2id, pass: password }
		}, commonOptions));
	};

	request[ADD_RIVAL] = function(playerid) {
		return rp(Object.assign({
			form: { mode: "rival_add", playerid: playerid }
		}, commonOptions));
	};

	request[DELETE_RIVAL] = function(playerid) {
		return rp(Object.assign({
			form: { mode: "rival_delete", playerid: playerid }
		}, commonOptions));
	};

	let confirm = {};

	confirm[LOGIN] = function(lr2id, $) {
		const $user = $("#user"); // ログイン form's container
		return $user.text().indexOf(`LR2ID:${lr2id}`) !== -1;
	};

	confirm[ADD_RIVAL] = function(playerid, $) {
		const ids = myPage.getRivalIds($);
		return ids.indexOf(playerid) !== -1;
	};

	confirm[DELETE_RIVAL] = function(playerid, $) {
		const ids = myPage.getRivalIds($);
		return ids.indexOf(playerid) === -1;
	};

	let requestAndConfirm = {};

	// don't know how to DRY...
	requestAndConfirm[LOGIN] = function(lr2id, password) {
		return new Promise(function(resolve, reject) {
			request[LOGIN](lr2id, password).then(function($) {
				const confirmed = confirm[LOGIN](lr2id, $);
				if (confirmed) {
					resolve($);
				} else {
					reject(UNSUCCESSFUL[LOGIN]);
				}
			}).catch(function(err) {
				reject(err); // TODO
			});
		});
	};

	requestAndConfirm[ADD_RIVAL] = function(playerid) {
		return new Promise(function(resolve, reject) {
			request[ADD_RIVAL](playerid).then(function($) {
				const confirmed = confirm[ADD_RIVAL](playerid, $);
				if (confirmed) {
					resolve($);
				} else {
					reject(UNSUCCESSFUL[ADD_RIVAL]);
				}
			}).catch(function(err) {
				reject(err);
			});
		});
	};

	requestAndConfirm[DELETE_RIVAL] = function(playerid) {
		return new Promise(function(resolve, reject) {
			request[DELETE_RIVAL](playerid).then(function($) {
				const confirmed = confirm[DELETE_RIVAL](playerid, $);
				if (confirmed) {
					resolve($);
				} else {
					reject(UNSUCCESSFUL[DELETE_RIVAL]);
				}
			}).catch(function(err) {
				reject(err);
			});
		});
	};

	return {
		request: request, 
		confirm: confirm,
		requestAndConfirm: requestAndConfirm
	};

})();


let user = {
	lr2id: "",
	password: ""
};
const setUser = function(lr2id, password) {
	user.lr2id = lr2id;
	user.password = password;
	return this;
};
const getUserCensored = function() {
	return {
		user: user.lr2id,
		password: user.password.replace(/./g, "*")
	};
};


function login(lr2id = user.lr2id, password = user.password) {
	return requestAndConfirm[LOGIN](lr2id, password);
}
function addRival(playerid) {
	let loginPromise = isExpired() ? login() : Promise.resolve();
	return loginPromise.then(() => requestAndConfirm[ADD_RIVAL](playerid));
}
function deleteRival(playerid) {
	let loginPromise = isExpired() ? login() : Promise.resolve();
	return loginPromise.then(() => requestAndConfirm[DELETE_RIVAL](playerid));
}


const lr2ir = {
	SERVICE: SERVICE,
	raw: { // TODO rename ?
		request: request,
		confirm: confirm,
		requestAndConfirm: requestAndConfirm,
	},
	setUser: setUser,
	getUserCensored: getUserCensored,
	login: login,
	addRival: addRival,
	deleteRival: deleteRival
};

module.exports = Object.freeze(lr2ir);
