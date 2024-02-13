const KorisnikDAO = require("./korisnikDAO.js");
const SerijaDAO = require("./serijaDAO.js");
const jwt = require("../moduli/jwt.js");
const enkripcija = require("../moduli/kodovi.js")
const dodajUDnevnik = require("../moduli/dnevnicki_zapis.js")
const mail = require("../moduli/mail.js");
const recaptcha = require("../moduli/recaptcha.js")
var QRCode = require('qrcode');
const base32 = require('base32-encoding');
const totp = require('totp-generator');

exports.getKorisnici = function (konf, zahtjev, odgovor) {
	let provjera = jwt.provjeriToken(zahtjev, konf.jwtTajniKljuc)
	if (zahtjev.session.korime == null) {
		odgovor.status(401)
		odgovor.send(JSON.stringify({ opis: "potrebna prijava" }))
	}
	else if (zahtjev.session.uloga != 1) {
		odgovor.status(403)
		odgovor.send(JSON.stringify({ opis: "zabranjen pristup" }))
	}
	else if (provjera) {
		dodajUDnevnik(zahtjev)
		odgovor.type("application/json");
		let kdao = new KorisnikDAO();
		kdao.dajSve().then((korisnici) => {
			odgovor.status(200)
			odgovor.send(JSON.stringify(korisnici));
		});
	}
};

exports.postKorisnici = async function (konf, zahtjev, odgovor) {
	odgovor.type("application/json");
	if (!(await recaptcha.provjeraRecaptcha(zahtjev.body.token, konf.recaptchaTajniKljuc))) {
		odgovor.status(400);
		odgovor.send(JSON.stringify({ greska: "Recaptcha provjera neuspjela" }))
	}
	let kdao = new KorisnikDAO();
	let provjera = jwt.provjeriToken(zahtjev, konf.jwtTajniKljuc)
	if (!provjera) {
		odgovor.status(401)
		odgovor.send(JSON.stringify({ opis: "potrebna prijava" }))
	}
	else if (zahtjev.session.uloga != 1) {
		odgovor.type("application/json");
		odgovor.status(403)
		odgovor.send(JSON.stringify({ opis: "zabranjen pristup" }))
	}
	else if (provjera) {
		dodajUDnevnik(zahtjev)
		let podaci = zahtjev.body.korisnik;
		if (podaci.korime == "Niste ulogirani") {
			odgovor.status(400)
			odgovor.send(JSON.stringify({ greska: "Nedopušteno korisničko ime" }))
		}
		podaci.lozinka = enkripcija.kreirajSHA256(podaci.lozinka)
		kdao.dodaj(podaci).then(async (poruka) => {
			if (poruka) {
				/*let porukaMail = "Registrirani ste! Vaše korisničko ime: " + podaci.korime +
					"Vaša lozina: " + podaci.lozinka;
				let mailPoruka = await mail.posaljiMail(
					"kmilos21@student.foi.hr",
					podaci.email,
					"Registracija računa",
					porukaMail
				); */
				odgovor.status(201)
				odgovor.type("application/json");
				odgovor.send(JSON.stringify({ opis: "izvrseno" }))
			}
			else {
				odgovor.status(400)
				odgovor.type("application/json");
				odgovor.send(JSON.stringify({ greska: "dupliciranje podataka" }))
			}
		});
	}
};

exports.deleteKorisnici = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	odgovor.status(501);
	let poruka = { opis: "metoda nije implementirana" };
	odgovor.send(JSON.stringify(poruka));
};

exports.putKorisnici = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	odgovor.status(501);
	let poruka = { opis: "metoda nije implementirana" };
	odgovor.send(JSON.stringify(poruka));
};

exports.getKorisnik = function (konf, zahtjev, odgovor) {
	odgovor.type("application/json");
	let korime = zahtjev.params.korime;
	let provjera = jwt.provjeriToken(zahtjev, konf.jwtTajniKljuc)
	if (!provjera) {
		odgovor.status(401)
		odgovor.send(JSON.stringify({ opis: "potrebna prijava" }))
	}
	else {
		let kdao = new KorisnikDAO()
		kdao.daj(korime).then((korisnik) => {
			if (korisnik != null) {
				dodajUDnevnik(zahtjev)
				odgovor.status(200)
				odgovor.send(JSON.stringify(korisnik))
			}
			else {
				odgovor.status(400)
				odgovor.send(JSON.stringify({ greska: "dohvacanje neuspjelo" }))
			}
		});
	}
}

exports.getKorisnikPrijava = async function (zahtjev, odgovor, konf) {
	odgovor.type("application/json");
	let kdao = new KorisnikDAO();
	let korime = zahtjev.params.korime;
	let token = zahtjev.body.token;
	let provjera = await recaptcha.provjeraRecaptcha(token, konf.recaptchaTajniKljuc);
	if (!provjera) {
		odgovor.status(400);
		odgovor.send(JSON.stringify({ greska: "Recaptcha provjera neuspjela" }))
		return;
	}
	let lozinka = enkripcija.kreirajSHA256(zahtjev.body.lozinka)
	kdao.daj(korime).then((korisnik) => {
		if (korisnik != null && korisnik.lozinka == lozinka) {
			odgovor.set('User-Uloga', korisnik.tipovi_korisnika_id);
			odgovor.set('User-Korime', korisnik.korime);
			odgovor.set('User-2FA', korisnik.ukljucena_2fa);
			odgovor.set("Access-Control-Expose-Headers", "User-Uloga, User-Korime, User-2FA")
			odgovor.status(201);
			zahtjev.session.mojId = korisnik.id
			zahtjev.session.korime = korisnik.korime;
			zahtjev.session.uloga = korisnik.tipovi_korisnika_id;
			zahtjev.session.fa = korisnik.ukljucena_2fa;
			odgovor.send(korisnik);
		}
		else {
			odgovor.status(400);
			odgovor.send(JSON.stringify({ greska: "Krivi podaci!" }));
		}
	});
};

exports.getKorisnikPrijavaJWT = function (konf, zahtjev, odgovor) {
	if (zahtjev.session.korime != null) {
		let korime = zahtjev.params.korime;
		let kdao = new KorisnikDAO();
		kdao.daj(korime).then((korisnik) => {
			let token = jwt.kreirajToken(korisnik, konf.jwtTajniKljuc, konf.jwtValjanost)
			odgovor.set('Authorization', 'Bearer ' + token);
			odgovor.set('Access-Control-Expose-Headers', 'Authorization');
			odgovor.status(201)
			odgovor.send(token)
		})
	}
	else if (zahtjev.session.githubToken != null) {
		let korime = zahtjev.params.korime;
		let token = jwt.kreirajToken(korime, konf.jwtTajniKljuc, konf.jwtValjanost)
		odgovor.set('Authorization', 'Bearer ' + token);
		odgovor.set('Access-Control-Expose-Headers', 'Authorization');
		odgovor.status(201)
		odgovor.send(token)
	}
	else {
		odgovor.status(401)
		odgovor.send(JSON.stringify({ opis: "zabranjen pristup" }))
	}
}

exports.postKorisnik = function (zahtjev, odgovor) {
	odgovor.type("application/json");
	odgovor.status(405);
	let poruka = { opis: "zabranjeno" };
	odgovor.send(JSON.stringify(poruka));
};

exports.deleteKorisnik = function (konf, zahtjev, odgovor) {
	let kdao = new KorisnikDAO();
	let provjera = jwt.provjeriToken(zahtjev, konf.jwtTajniKljuc)
	let korime = zahtjev.params.korime;
	if (!provjera) {
		odgovor.status(401)
		odgovor.send(JSON.stringify({ opis: "potrebna prijava" }))
	}
	else if (zahtjev.session.uloga != 1) {
		odgovor.status(403)
		odgovor.send(JSON.stringify({ opis: "zabranjen pristup" }))
	}
	else if (provjera) {
		kdao.daj(korime).then(async (korisnik) => {
			let sdao = new SerijaDAO();
			if (korisnik.tipovi_korisnika_id == 1) {
				odgovor.status(400)
				odgovor.send(JSON.stringify({ opis: "ne možete izbrisati admina" }))
			}
			else {
				odgovor.type("application/json");
				await sdao.obrisiFavorite(korisnik.id)
				kdao.obrisi(korisnik.korime).then((uspjeh) => {
					if (uspjeh) {
						dodajUDnevnik(zahtjev)
						odgovor.status(201)
						odgovor.send(JSON.stringify({ opis: "izvrseno" }))
					}
					else {
						odgovor.status(400)
						odgovor.send(JSON.stringify({ opis: "neuspjelo brisanje" }))
					}
				}).catch((err) => {
					console.log("Greska: " + err)
				});
			}
		});
	}

};

exports.putKorisnik = async function (konf, zahtjev, odgovor) {
	odgovor.type("application/json");
	let provjera = jwt.provjeriToken(zahtjev, konf.jwtTajniKljuc);

	if (!provjera) {
		odgovor.status(401)
		odgovor.send(JSON.stringify({ opis: "potrebna prijava" }))
	}
	else {
		let korime = zahtjev.params.korime;
		let podaci = zahtjev.body.korisnik;
		let token = zahtjev.body.token;
		let provjera = await recaptcha.provjeraRecaptcha(token, konf.recaptchaTajniKljuc);
		if (!provjera) {
			odgovor.status(400);
			odgovor.send(JSON.stringify({ greska: "Recaptcha provjera neuspjela" }))
		}
		let kdao = new KorisnikDAO();
		podaci.lozinka = enkripcija.kreirajSHA256(podaci.lozinka)

		kdao.azuriraj(korime, podaci).then((poruka) => {
			if (poruka) {
				dodajUDnevnik(zahtjev)
				odgovor.status(201).send(JSON.stringify({ opis: "izvrseno" }));
			} else {
				odgovor.status(400).send(JSON.stringify({ greska: "nuspjelo azuriranje" }));
			}
		});
	}
}
exports.putKorisnik2FA = async function (konf, zahtjev, odgovor) {
	odgovor.type("application/json");
	let provjera = jwt.provjeriToken(zahtjev, konf.jwtTajniKljuc);
	if (!provjera) {
		odgovor.status(401)
		odgovor.send(JSON.stringify({ opis: "potrebna prijava" }))
	}
	else {
		let korime = zahtjev.body.korime;
		let tajni_kljuc = kreirajTajniKljuc(korime);
		let kdao = new KorisnikDAO();
		kdao.azuriraj2FA(korime, tajni_kljuc).then(async (kljuc) => {
			odgovor.status(201);
			let qrKod = await QRCode.toDataURL(kljuc)
			let podaci = [qrKod, kljuc]
			odgovor.send(JSON.stringify(podaci));
		});
	}
};

exports.provjeriTotp = async function (zahtjev, odgovor) {
	odgovor.type("application/json");
	let uneseniTajniKljuc = zahtjev.body.uneseniTotpKljuc;
	let korime = zahtjev.body.korime;
	let kdao = new KorisnikDAO();
	let odg = await kdao.dajTajniKod(korime);
	console.log(uneseniTajniKljuc)
	const kod = totp(odg[0].tajni_kljuc, {
		digits: 6,
		algorithm: "SHA-512",
		period: 60
	});
	if (uneseniTajniKljuc == kod) {
		odgovor.status(201)
		odgovor.send("/")
	}
	else {
		odgovor.status(400)
		odgovor.send(JSON.stringify({ greska: "Kodovi se ne podudaraju" }))
	}
	return false;
}


function kreirajTajniKljuc(korime) {
	let tekst = korime + new Date();
	let hash = enkripcija.kreirajSHA256(tekst);
	let tajniKljuc = base32.stringify(hash, "ABCDEFGHIJKLMNOPRSTQRYWXZ234567");
	return tajniKljuc.toUpperCase();
}