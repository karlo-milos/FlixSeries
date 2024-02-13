const jwt = require("jsonwebtoken")

exports.kreirajToken = function (korisnik, jwtTajniKljuc, jwtValjanost) {
	let vrijeme = jwtValjanost.toString() + "s"
	let token
	if (korisnik.korime !== null || korisnik.korime !== undefined || korisnik.korime !== "") {
		token = jwt.sign({ korime: korisnik.korime }, jwtTajniKljuc, { expiresIn: vrijeme });
	}
	else {
		token = jwt.sign({ korisnik }, jwtTajniKljuc, { expiresIn: vrijeme });
	}
	return token;
}

exports.provjeriToken = function (zahtjev, tajniKljucJWT) {
	if (zahtjev.headers.authorization != null) {
		let token = zahtjev.headers.authorization.split(" ")[1];
		try {
			let podaci = jwt.verify(token, tajniKljucJWT);
			return true;
		} catch (e) {
			console.log(e)
			return false;
		}
	}
	return false;
}

exports.dajTijelo = function (token) {
	let dijelovi = token.split(".");
	return JSON.parse(dekodirajBase64(dijelovi[1]));
}

function dekodirajBase64(data) {
	let buff = Buffer.from(data, 'base64');
	return buff.toString('ascii');
}
