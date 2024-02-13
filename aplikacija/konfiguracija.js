const ds = require("fs/promises");

class Konfiguracija {
	constructor() {
		this.konf = {};
	}
	dajKonf() {
		return this.konf;
	}


	async ucitajKonfiguraciju() {
		let podaci
		try {
			podaci = await ds.readFile(process.argv[2], "UTF-8");
		}
		catch {
			console.log("Ne može se pročitati datoteka")
			return false;
		}
		if (podaci !== undefined) {
			this.konf = pretvoriJSONkonfig(podaci);
			return true;
		}
	}

}

function pretvoriJSONkonfig(podaci) {
	let konf = {};
	var nizPodataka = podaci.split("\n");
	for (let podatak of nizPodataka) {
		var podatakNiz = podatak.split(":");
		var naziv = podatakNiz[0];
		var vrijednost = podatakNiz[1];
		konf[naziv] = vrijednost;
	}
	return konf;
}

module.exports = Konfiguracija;
