const Baza = require("../db/sqliteBaza.js");

class DnevnikDAO {

	constructor() {
		this.baza = new Baza("./RWA2023kmilos21.sqlite");
	}

	dajSve = async function () {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM dnevnicki_zapisi ORDER BY datum DESC"
		var podaci = await this.baza.izvrsiUpit(sql, []);
		this.baza.zatvoriVezu();
		return podaci;
	}

	dajStranicu = async function (limit, offset, sortiraj) {
		this.baza.spojiSeNaBazu();
		let sql
		if (sortiraj == "d") {
			sql = "SELECT * FROM dnevnicki_zapisi ORDER BY datum DESC, vrijeme DESC LIMIT ? OFFSET ?";
		}
		else {
			sql = "SELECT * FROM dnevnicki_zapisi ORDER BY zahtjev LIMIT ? OFFSET ?";
		}
		var podaci = await this.baza.izvrsiUpit(sql, [limit, offset]);
		this.baza.zatvoriVezu();
		return podaci;
	}

	dodaj = async function (sadrzaj) {
		let sql = `INSERT INTO dnevnicki_zapisi (datum, vrijeme, zahtjev, resurs, tijelo, korime) VALUES (?, ?, ?, ?, ?, ?)`;
		let podaci = [sadrzaj.datum, sadrzaj.vrijeme, sadrzaj.zahtjev, sadrzaj.putanja, sadrzaj.tijelo, sadrzaj.korime];
		await this.baza.izvrsiUpit(sql, podaci);
		return true;
	}
}

module.exports = DnevnikDAO