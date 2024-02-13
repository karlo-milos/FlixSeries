const jwt = require("../moduli/jwt.js");

class TMDBklijent {
    bazicniURL = "https://api.themoviedb.org/3";

    constructor(apiKljuc) {
        this.apiKljuc = apiKljuc;
    }

    async dohvatiSeriju(konf, zahtjev, id) {
        let provjera = jwt.provjeriToken(zahtjev, konf.jwtTajniKljuc)
        if (provjera) {
            let resurs = "/tv/" + id;
            let odgovor = await this.obaviZahtjev(resurs);
            return odgovor;
        }
        else if (zahtjev.headers.github != null || zahtjev.headers.github != undefined) {
            let resurs = "/tv/" + id;
            let odgovor = await this.obaviZahtjev(resurs);
            return odgovor;
        }
    }
    async pretraziSerijePoNazivu(konf, zahtjev, trazi, stranica) {
        let provjera = jwt.provjeriToken(zahtjev, konf.jwtTajniKljuc)
        if (provjera) {
            let odgovor = await this.pretrazi(trazi, stranica);
            return odgovor;
        }
        else if (zahtjev.headers.github != null || zahtjev.headers.github != undefined) {
            let odgovor = await this.pretrazi(trazi, stranica);
            return odgovor;
        }
    }

    async pretrazi(trazi, stranica) {
        let resurs = "/search/tv";
        let parametri = {
            sort_by: "popularity.desc",
            include_adult: false,
            page: stranica,
            query: trazi
        };
        let odgovor = await this.obaviZahtjev(resurs, parametri);
        return odgovor;
    }

    async obaviZahtjev(resurs, parametri = "") {
        let zahtjev = this.bazicniURL + resurs + "?api_key=" + this.apiKljuc;
        for (let p in parametri) {
            zahtjev += "&" + p + "=" + parametri[p];
        }
        let odgovor = await fetch(zahtjev);
        let rezultat = await odgovor.text();
        return rezultat;
    }
}

module.exports = TMDBklijent;
