const DnevnikDAO = require("./dnevnikDAO.js");
const jwt = require("../moduli/jwt.js");

exports.getDnevnik = async function (konf, zahtjev, odgovor) {
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
        let stranica = zahtjev.query.stranica
        let sortiraj = zahtjev.query.sortiraj
        let zapisi;
        odgovor.type("application/json");
        let ddao = new DnevnikDAO();
        zapisi = await ddao.dajSve();
        let ukupno = Math.ceil(zapisi.length / konf.appStranicenje)
        let offset = (stranica - 1) * konf.appStranicenje;
        let limit = parseInt(konf.appStranicenje);
        ddao.dajStranicu(limit, offset, sortiraj).then((filtrirano) => {
            zapisi = filtrirano
            let podaci = [zapisi, stranica, ukupno]
            odgovor.status(200)
            odgovor.send(JSON.stringify(podaci));
        })
    }
    else {
        odgovor.status(417)
        odgovor.send(JSON.stringify({ opis: "neočekivani podaci" }));
    }
};
