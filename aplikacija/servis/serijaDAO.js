const { TokenExpiredError } = require("jsonwebtoken");
const Baza = require("../db/sqliteBaza.js");

class SerijaDAO {

	constructor() {
		this.baza = new Baza("./RWA2023kmilos21.sqlite");
	}

	dajSveFavorite = async function (id) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT serije.* FROM serije JOIN favoriti ON serije.id = favoriti.serije_id WHERE favoriti.korisnici_id =?";
		var podaci = await this.baza.izvrsiUpit(sql, [id]);
		this.baza.zatvoriVezu();
		return podaci;
	}

	dajSveSezone = async function (id_serije) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM sezone WHERE serije_id=?";
		var podaci = await this.baza.izvrsiUpit(sql, [id_serije]);
		this.baza.zatvoriVezu();
		return podaci;
	}

	dajSeriju = async function (id) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM serije WHERE tmdb_id=?;"
		var podaci = await this.baza.izvrsiUpit(sql, [id]);
		this.baza.zatvoriVezu();
		if (podaci.length == 1)
			return podaci[0];
		else
			return null;
	}

	dajFavorita = async function (id_korisnika, id_filma) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM favoriti WHERE korisnici_id=? AND serije_id=?;";
		var podaci = await this.baza.izvrsiUpit(sql, [id_korisnika, id_filma]);
		this.baza.zatvoriVezu();
		if (podaci.length === 1) {
			return podaci[0];
		} else {
			return null;
		}
	}

	dodajSeriju = async function (serija) {
		this.baza.spojiSeNaBazu();
		let sql = `INSERT INTO serije (naziv,opis,broj_sezona,ukupan_broj_epizoda,popularnost,slika,homepage,tmdb_id)
				   VALUES (?,?,?,?,?,?,?,?)`;
		let podaci = [serija.name, serija.overview,
		serija.number_of_seasons, serija.number_of_episodes,
		serija.popularity, serija.poster_path, serija.homepage,
		serija.id]
		await this.baza.izvrsiUpit(sql, podaci);
		this.baza.zatvoriVezu();
		return true;
	}

	dodajSezonu = async function (sezona, id) {
		this.baza.spojiSeNaBazu();
		let sql = `INSERT INTO sezone (naziv,opis,slika,broj_sezone,broj_epizoda,tmdb_id,serije_id)
				   VALUES (?,?,?,?,?,?,?)`;
		let podaci = [sezona.name, sezona.overview, sezona.poster_path,
		sezona.season_number, sezona.episode_count, sezona.id, id]
		await this.baza.izvrsiUpit(sql, podaci);
		this.baza.zatvoriVezu();
		return true;
	}

	dodajFavorita = async function (korisnik_id, serija_id) {
		this.baza.spojiSeNaBazu();
		let sql = `INSERT INTO favoriti (korisnici_id,serije_id) VALUES (?,?)`;
		let podaci = [korisnik_id, serija_id];
		await this.baza.izvrsiUpit(sql, podaci);
		this.baza.zatvoriVezu();
		return true;
	}

	obrisiFavorite = async function (id) {
		this.baza.spojiSeNaBazu();
		let sql = "DELETE FROM favoriti WHERE korisnici_id=?";
		await this.baza.izvrsiUpit(sql, [id]);
		this.baza.zatvoriVezu();
		return true;
	}
}

module.exports = SerijaDAO