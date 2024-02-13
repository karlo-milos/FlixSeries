const Baza = require("../db/sqliteBaza.js");

class KorisnikDAO {

	constructor() {
		this.baza = new Baza("./RWA2023kmilos21.sqlite");
	}

	dajSve = async function () {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM korisnici;"
		var podaci = await this.baza.izvrsiUpit(sql, []);
		this.baza.zatvoriVezu();
		return podaci;
	}

	daj = async function (korime) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM korisnici WHERE korime=?;"
		var podaci = await this.baza.izvrsiUpit(sql, [korime]);
		this.baza.zatvoriVezu();
		if (podaci.length == 1)
			return podaci[0];
		else
			return null;
	}

	dodaj = async function (korisnik) {
		const provjeraEmaila = await this.provjeriEmail(korisnik.email);
		const provjeraKorisnickogImena = await this.provjeriKorisnickoIme(korisnik.korime);
		if (provjeraEmaila) {
			console.log('Korisnik s istim emailom već postoji.');
			return false;
		}
		if (provjeraKorisnickogImena) {
			console.log('Korisnik s istim korisničkim imenom već postoji.');
			return false;
		}
		let sql = `INSERT INTO korisnici (ime, prezime, tipovi_korisnika_id, adresa,
			       korime, lozinka, email,
				   postanski_broj, rod, tajni_kljuc, vidljivost_tajnog_kljuca, ukljucena_2fa)
				   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
		let podaci = [korisnik.ime, korisnik.prezime,
		korisnik.tipovi_korisnika_id, korisnik.adresa,
		korisnik.korime, korisnik.lozinka, korisnik.email,
		korisnik.postanski_broj, korisnik.rod, korisnik.tajni_kljuc,
		korisnik.vidljivost_tajnog_kljuca, korisnik.ukljucena_2fa];
		await this.baza.izvrsiUpit(sql, podaci);
		console.log('Korisnik uspješno dodan.');
		return true;
	}

	obrisi = async function (korime) {
		this.baza.spojiSeNaBazu();
		let sql = "DELETE FROM korisnici WHERE korime=?";
		await this.baza.izvrsiUpit(sql, [korime]);
		this.baza.zatvoriVezu();
		return true;
	}

	azuriraj = async function (korime, korisnik) {
		let sql = `UPDATE korisnici SET ime=?, prezime=?, lozinka=?, email=?,postanski_broj=?, adresa=?,rod=?,
		ukljucena_2fa=? WHERE korime=?`;
		let podaci = [korisnik.ime, korisnik.prezime,
		korisnik.lozinka, korisnik.email,
		korisnik.postanski_broj, korisnik.adresa,
		korisnik.rod, korisnik.ukljucena_2fa, korime];
		await this.baza.izvrsiUpit(sql, podaci);
		return true;
	}

	azuriraj2FA = async function (korime, tajni_kljuc) {
		let sql = `UPDATE korisnici SET tajni_kljuc=?, vidljivost_tajnog_kljuca=false WHERE korime=?`;
		let podaci = [tajni_kljuc, korime];
		await this.baza.izvrsiUpit(sql, podaci);
		return tajni_kljuc;
	}

	provjeriEmail = async function (email) {
		let sql = `SELECT * FROM korisnici WHERE email = ?`;
		let podaci = [email];
		const rezultat = await this.baza.izvrsiUpit(sql, podaci);
		return rezultat.length > 0;
	}

	dajTajniKod = async function (korime) {
		let sql = `SELECT tajni_kljuc FROM korisnici WHERE korime = ?`;
		let podaci = [korime];
		const rezultat = await this.baza.izvrsiUpit(sql, podaci);
		return rezultat;
	}

	provjeriKorisnickoIme = async function (korime) {
		let sql = `SELECT * FROM korisnici WHERE korime = ?`;
		let podaci = [korime];
		const rezultat = await this.baza.izvrsiUpit(sql, podaci);
		return rezultat.length > 0;
	}
}

module.exports = KorisnikDAO