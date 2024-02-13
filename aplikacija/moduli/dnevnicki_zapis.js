const DnevnikDAO = require("../servis/dnevnikDAO.js")
const jwt = require("./jwt.js");


function dohvatiVrijeme() {
    const sada = new Date();
    let dan = sada.getDate();
    let mjesec = sada.getMonth() + 1;
    let godina = sada.getFullYear();

    let danString = dan < 10 ? '0' + dan : dan;
    let mjesecString = mjesec < 10 ? '0' + mjesec : mjesec;
    let datum = danString + "." + mjesecString + "." + godina;

    let sati = sada.getHours();
    let minute = sada.getMinutes();
    let sekunde = sada.getSeconds();

    let satiString = sati < 10 ? '0' + sati : '' + sati;
    let minuteString = minute < 10 ? '0' + minute : '' + minute;
    let sekundeString = sekunde < 10 ? '0' + sekunde : '' + sekunde;

    let vrijeme = satiString + ":" + minuteString + ":" + sekundeString;

    return [datum, vrijeme];
}

function dodajUDnevnik(zahtjev) {
    let ddao = new DnevnikDAO()
    let tipZahtjeva = zahtjev.method
    const cijelaPutanja = zahtjev.originalUrl;
    let vremenskiPodaci = dohvatiVrijeme()
    let tijelo = zahtjev.body ? JSON.stringify(zahtjev.body) : null;
    if (tijelo == "{}") {
        tijelo = null;
    }
    let kor = jwt.dajTijelo(zahtjev.headers.authorization)
    let podaci = {
        datum: vremenskiPodaci[0],
        vrijeme: vremenskiPodaci[1],
        zahtjev: tipZahtjeva,
        putanja: cijelaPutanja,
        tijelo: tijelo,
        korime: kor.korime
    }
    ddao.dodaj(podaci).then((gotovo) => {
    })

}
module.exports = dodajUDnevnik;