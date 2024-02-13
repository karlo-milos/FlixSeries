const crypto = require('crypto');
const sol = "Ovo je sol"
exports.kreirajSHA256 = function (tekst) {
	const hash = crypto.createHash('sha256');
	hash.write(tekst + sol);
	var izlaz = hash.digest('hex');
	hash.end();
	return izlaz;
}

