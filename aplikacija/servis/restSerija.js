const SerijaDAO = require("./serijaDAO.js");
const jwt = require("../moduli/jwt.js");
const dodajUDnevnik = require("../moduli/dnevnicki_zapis.js")
const provjeraResursa = require("../moduli/provjeraResursa.js");

exports.getFavoriti = function (konf, zahtjev, odgovor) {
	let provjera = jwt.provjeriToken(zahtjev, konf.jwtTajniKljuc)
	if (zahtjev.session.korime == null) {
		odgovor.status(401)
		odgovor.send(JSON.stringify({ opis: "potrebna prijava" }))
	}
	else if (zahtjev.session.uloga != 1 && zahtjev.session.uloga != 2) {
		odgovor.status(403)
		odgovor.send(JSON.stringify({ opis: "zabranjen pristup" }))
	}
	else if (provjera) {
		dodajUDnevnik(zahtjev)
		odgovor.type("application/json");
		let sdao = new SerijaDAO();
		let id = zahtjev.session.mojId;
		sdao.dajSveFavorite(id).then((serije) => {
			odgovor.status(200)
			odgovor.send(JSON.stringify(serije));
		});
	}
};

exports.postFavoriti = function (konf, zahtjev, odgovor) {
	let sdao = new SerijaDAO();
	let provjera = jwt.provjeriToken(zahtjev, konf.jwtTajniKljuc)
	if (!provjera) {
		odgovor.status(401)
		odgovor.send(JSON.stringify({ opis: "potrebna prijava" }))
	}
	else if (zahtjev.session.uloga != 2 && zahtjev.session.uloga != 1) {
		odgovor.type("application/json");
		odgovor.status(403)
		odgovor.send(JSON.stringify({ opis: "zabranjen pristup" }))
	}
	else if (provjera) {
		let serija = zahtjev.body;
		let korID = zahtjev.session.mojId
		dodajUDnevnik(zahtjev)
		sdao.dajSeriju(serija.id).then((rezultat) => {
			if (rezultat == null) {
				sdao.dodajSeriju(serija).then((res) => {
					sdao.dajSeriju(serija.id).then(async (rezultat) => {
						let id = rezultat.id;
						let sezoneBroj = serija.seasons.length;
						for (let i = 0; i < sezoneBroj; i++)
							await sdao.dodajSezonu(serija.seasons[i], id)
						sdao.dodajFavorita(korID, id).then((kraj) => {
							odgovor.status(201)
							odgovor.send(JSON.stringify({ opis: "izvrseno" }))
						})
					})
				})
			} else if (rezultat != null) {
				let id = rezultat.id
				sdao.dajFavorita(korID, id).then((serija) => {
					if (serija == null) {
						sdao.dodajFavorita(korID, id).then((kraj) => {
							dodajUDnevnik(zahtjev)
							odgovor.status(201)
							odgovor.send(JSON.stringify({ opis: "izvrseno" }))
						})
					} else {
						odgovor.status(400)
						odgovor.send(JSON.stringify({ opis: "Serija je već u favoritima" }))
					}
				})
			}
			else {
				odgovor.status(400)
				odgovor.send(JSON.stringify({ opis: "Dodavanje nije uspjelo" }))
			}
		})
	};
}

exports.deleteFavoriti = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	odgovor.status(501);
	let poruka = { opis: "metoda nije implementirana" };
	odgovor.send(JSON.stringify(poruka));
};

exports.putFavoriti = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	odgovor.status(501);
	let poruka = { opis: "metoda nije implementirana" };
	odgovor.send(JSON.stringify(poruka));
};

/*FAVORIT*/

exports.getFavorit = function (konf, zahtjev, odgovor) {
	let provjera = jwt.provjeriToken(zahtjev, konf.jwtTajniKljuc)
	if (!provjera) {
		odgovor.type("application/json");
		odgovor.status(401)
		odgovor.send(JSON.stringify({ opis: "potrebna prijava" }))
	}
	else {
		let id = zahtjev.params.id;
		let sdao = new SerijaDAO()
		if (!provjeraResursa.provjeriResurs(id, odgovor)) {
			odgovor.type("application/json");
			odgovor.status(417)
			odgovor.send(JSON.stringify({ opis: "neočekivani podaci" }))
		}
		sdao.dajSeriju(id).then((serija) => {
			if (serija != null) {
				sdao.dajSveSezone(serija.id).then((sezone) => {
					dodajUDnevnik(zahtjev)
					odgovor.type("application/json");
					odgovor.status(200)
					let podaci = [serija, sezone]
					odgovor.send(JSON.stringify(podaci))
				})
			} else {
				odgovor.type("application/json");
				odgovor.status(400)
				odgovor.send(JSON.stringify({ greska: "Serija ne postoji" }))
			}
		})
	};
}

exports.deleteFavorit = function (konf, zahtjev, odgovor) {
	let provjera = jwt.provjeriToken(zahtjev, konf.jwtTajniKljuc)
	if (!provjera) {
		odgovor.type("application/json");
		odgovor.status(401)
		odgovor.send(JSON.stringify({ opis: "potrebna prijava" }))
	}
	else {
		let id = zahtjev.params.id;
		let sdao = new SerijaDAO()
		sdao.obrisiFavorite(id).then((rezultat) => {
			odgovor.type("application/json");
			odgovor.status(201)
			odgovor.send(JSON.stringify({ opis: "izvrseno" }))
		})
	}
}
exports.postFavorit = function (zahtjev, odgovor) {
	odgovor.status(405);
	odgovor.type("application/json");
	let poruka = { opis: "zabranjeno" };
	odgovor.send(JSON.stringify(poruka));
};

exports.putFavorit = function (konf, zahtjev, odgovor) {
	odgovor.type("application/json");
	odgovor.status(405);
	let poruka = { opis: "zabranjeno" };
	odgovor.send(JSON.stringify(poruka));
};
