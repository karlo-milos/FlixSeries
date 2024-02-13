import express from "express";
import session from 'express-session';
import Konfiguracija from "./konfiguracija.js";
import { ProvjeriKonfiguraciju } from './moduli/provjeraKonfiguracije.mjs';
import restKorisnik from "./servis/restKorisnik.js";
import restSerija from "./servis/restSerija.js";
import restDnevnik from "./servis/restDnevnik.js";
import TMDBklijent from "./servis/TMDBklijent.js";
import cors from 'cors';

const server = express();
let konf = new Konfiguracija();

const corsOptions = {
  origin: ['http://localhost:4200', 'https://github.com'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};
server.use(cors(corsOptions));

konf
  .ucitajKonfiguraciju()
  .then((uspjesnoUcitavanje) => {
    if (uspjesnoUcitavanje && ProvjeriKonfiguraciju(konf.dajKonf())) {
      pokreniServer();
    } else {
      console.log("Server se neće pokrenuti zbog neispravne konfiguracije ili problema s čitanjem datoteke.");
    }
  })
  .catch((greska) => {
    if (process.argv.length == 2) {
      console.log("Molim unesite naziv datoteke!");
    } else {
      console.log(greska);
    }
  });

function pokreniServer() {
  const angularBuild = './angular/browser';
  const dokumentacija = './dokumentacija';
  server.use(express.static(angularBuild));
  server.use('/dokumentacija', express.static(dokumentacija));
  server.get('/', (req, res) => {
    res.sendFile(angularBuild + '/index.html');
  });
  server.get('/dokumentacija', (req, res) => {
    res.sendFile(dokumentacija + '/dokumentacija.html', { root: "./" });
  });
  server.use(express.urlencoded({ extended: true }));
  server.use(express.json());
  const port = 65300;

  server.use(
    session({
      secret: konf.dajKonf().tajniKljucSesija,
      saveUninitialized: true,
      cookie: {
        maxAge: 1000 * 60 * 1000,
        httpOnly: false,
        secure: false,
      },
      resave: false,
    })
  );

  pripremiPutanjeKorisnik();
  pripremiPutanjeSerije();
  pripremiPutanjeFavoriti();
  pripremiPutanjeDnevnik();

  server.use((zahtjev, odgovor) => {
    odgovor.status(404)
    odgovor.send(JSON.stringify({ opis: "nema resursa" }))
  });
  server.listen(port, () => {
    console.log(`Server pokrenut na portu: ${port}`);
  });
}

function pripremiPutanjeKorisnik() {

  server.get("/githubPovratno", async (zahtjev, odgovor) => {
    let token = await dajAccessToken(zahtjev.query.code);
    zahtjev.session.githubToken = token;
    odgovor.redirect("http://localhost:65300/");
  })

  server.get("/recaptchaKljuc", (zahtjev, odgovor) => {
    let podatak = konf.dajKonf().recaptchaSiteKljuc;
    odgovor.status(200);
    odgovor.send(podatak);
  })
  server.get("/githubKlijentKljuc", (zahtjev, odgovor) => {
    let podatak = konf.dajKonf().githubKlijentKljuc;
    odgovor.status(200);
    odgovor.send(podatak);
  })

  server.get("/github", (zahtjev, odgovor) => {
    let podatak = zahtjev.session.githubToken;
    odgovor.send(podatak);
  })

  server.get("/sesija", (zahtjev, odgovor) => {
    let podaci = {
      korime: zahtjev.session.korime,
      uloga: zahtjev.session.uloga,
      fa: zahtjev.session.fa
    }
    odgovor.send(JSON.stringify(podaci));
  })

  server.get("/unistiSesiju", (zahtjev, odgovor) => {
    zahtjev.session.destroy((err) => {
      if (err) {
        odgovor.status(500).send("Greška prilikom odjave");
      } else {
        odgovor.status(200)
        odgovor.send(JSON.stringify({ opis: "Uspješno obavljeno" }));
      }
    });
  });

  server.get("/baza/korisnici", (zahtjev, odgovor) => {
    restKorisnik.getKorisnici(konf.dajKonf(), zahtjev, odgovor)
  })

  server.post("/baza/korisnici", (zahtjev, odgovor) => {
    restKorisnik.postKorisnici(konf.dajKonf(), zahtjev, odgovor)
  })

  server.put("/baza/korisnici", restKorisnik.putKorisnici);

  server.delete("/baza/korisnici", restKorisnik.deleteKorisnici);

  server.get("/baza/korisnici/:korime", (zahtjev, odgovor) => {
    restKorisnik.getKorisnik(konf.dajKonf(), zahtjev, odgovor)
  });

  server.post("/baza/korisnici/:korime", restKorisnik.postKorisnik);

  server.put("/baza/korisnici/2fa", (zahtjev, odgovor) => {
    restKorisnik.putKorisnik2FA(konf.dajKonf(), zahtjev, odgovor)
  });

  server.put("/baza/korisnici/:korime", (zahtjev, odgovor) => {
    restKorisnik.putKorisnik(konf.dajKonf(), zahtjev, odgovor)
  });

  server.delete("/baza/korisnici/:korime", (zahtjev, odgovor) => {
    restKorisnik.deleteKorisnik(konf.dajKonf(), zahtjev, odgovor)
  })

  server.post("/baza/korisnici/:korime/prijava", (zahtjev, odgovor) => {
    restKorisnik.getKorisnikPrijava(zahtjev, odgovor, konf.dajKonf());
  });

  server.get("/baza/korisnici/:korime/prijava", (zahtjev, odgovor) => {
    restKorisnik.getKorisnikPrijavaJWT(konf.dajKonf(), zahtjev, odgovor);
  });

  server.post("/baza/korisnici/totp/provjera", (zahtjev, odgovor) => {
    restKorisnik.provjeriTotp(zahtjev, odgovor);
  });
}

function pripremiPutanjeSerije() {
  server.get("/api/serije", async (zahtjev, odgovor) => {
    let filter = zahtjev.query.filter;
    let tmdbKlijent = new TMDBklijent(konf.dajKonf().tmdbApiKeyV3)
    let podaci = await tmdbKlijent.pretraziSerijePoNazivu(konf.dajKonf(), zahtjev, filter, 1)
    odgovor.send(podaci)
  })

  server.get("/api/serija", async (zahtjev, odgovor) => {
    let id = zahtjev.query.id;
    let tmdbKlijent = new TMDBklijent(konf.dajKonf().tmdbApiKeyV3)
    let podaci = await tmdbKlijent.dohvatiSeriju(konf.dajKonf(), zahtjev, id)
    odgovor.send(podaci)
  })
}

function pripremiPutanjeFavoriti() {
  server.post("/baza/favoriti", (zahtjev, odgovor) => {
    restSerija.postFavoriti(konf.dajKonf(), zahtjev, odgovor)
  })
  server.get("/baza/favoriti", (zahtjev, odgovor) => {
    restSerija.getFavoriti(konf.dajKonf(), zahtjev, odgovor)
  })
  server.put("/baza/favoriti", restSerija.putFavoriti);
  server.delete("/baza/favoriti", restSerija.deleteFavoriti);

  server.get("/baza/favoriti/:id", (zahtjev, odgovor) => {
    restSerija.getFavorit(konf.dajKonf(), zahtjev, odgovor)
  })
  server.post("/baza/favoriti/:id", restSerija.postFavorit);
  server.put("/baza/favoriti/:id", restSerija.putFavorit);

  server.delete("/baza/favoriti/:id", (zahtjev, odgovor) => {
    restSerija.deleteFavorit(konf.dajKonf(), zahtjev, odgovor)
  })
}

function pripremiPutanjeDnevnik() {
  server.get("/baza/dnevnik", (zahtjev, odgovor) => {
    restDnevnik.getDnevnik(konf.dajKonf(), zahtjev, odgovor)
  })
}

async function dajAccessToken(dobiveniKod) {
  let parametri = { method: "POST", headers: { Accept: "application/json" } }
  let urlParametri = "?client_id=" + konf.dajKonf().githubKlijentKljuc +
    "&client_secret=" + konf.dajKonf().githubTajniKljuc +
    "&code=" + dobiveniKod;
  let o = await fetch("https://github.com/login/oauth/access_token"
    + urlParametri, parametri);
  let podaci = await o.text();
  return JSON.parse(podaci).access_token;
}


