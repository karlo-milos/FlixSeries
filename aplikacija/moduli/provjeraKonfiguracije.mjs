function ProvjeriStranicenje(appStranicenje) {
  if (!appStranicenje) {
    console.log("Problem s konfiguracijom - appStranicenje ne postoji")
    return false
  }
  if (appStranicenje < 5 || appStranicenje > 100 || isNaN(appStranicenje)) {
    console.log("Problem s konfiguracijom - appStranicenje mora biti BROJ između 5 i 100")
    return false
  }
  else return true;
}

function ProvjeriJwtValjanost(jwtValjanost) {
  if (!jwtValjanost) {
    console.log("Problem s konfiguracijom - jwtValjanost ne postoji")
    return false
  }
  if (jwtValjanost < 15 || jwtValjanost > 3600 || isNaN(jwtValjanost)) {
    console.log("Problem s konfiguracijom - jwt valjanost mora biti BROJ između 15 i 3600")
    return false
  }
  else return true;
}

function ProvjeriJwtTajniKljuc(jwtTajniKljuc) {
  if (!jwtTajniKljuc) {
    console.log("Problem s konfiguracijom - jwtTajniKljuc ne postoji")
    return false
  }
  if (jwtTajniKljuc.length < 50 || jwtTajniKljuc.length > 100) {
    console.log("Problem s konfiguracijom - jwt tajni kljuc mora biti dužine znakova od 50 do 100")
    return false
  }
  else return true;
}

function ProvjeriTajniKljucSesija(tajniKljucSesija) {
  if (!tajniKljucSesija) {
    console.log("Problem s konfiguracijom - tajniKljucSesija ne postoji")
    return false
  }
  if (tajniKljucSesija.length < 50 || tajniKljucSesija.length > 100) {
    console.log("Problem s konfiguracijom - tajni kljuc sesije mora biti dužine znakova od 50 do 100")
    return false;
  }
  else return true;
}

function ProvjeriTMDBKljuceve(tmdbApiKeyV3, tmdbApiKeyV4) {
  if (!tmdbApiKeyV3 || !tmdbApiKeyV4) {
    console.log("Problem s konfiguracijom - Jedan od TMDB ključeva ne postoji")
    return false
  }
  return true;
}

function ProvjeraGithubKlijentKljuc(githubKlijentKljuc) {
  if (!githubKlijentKljuc) {
    console.log("Problem s konfiguracijom - Upišite Vaš Github Klijent ključ")
    return false
  }
  return true;
}
function ProvjeraGithubTajniKljuc(githubTajniKljuc) {
  if (!githubTajniKljuc) {
    console.log("Problem s konfiguracijom - Upišite Vaš Github Tajni ključ")
    return false
  }
  return true;
}
function ProvjeraRecaptchaKljuc(recaptchaKljuc) {
  if (!recaptchaKljuc) {
    console.log("Problem s konfiguracijom - Upišite Vaš Recaptcha ključ")
    return false
  }
  return true;
}
function ProvjeraRecaptchaTajniKljuc(recaptchaTajniKljuc) {
  if (!recaptchaTajniKljuc) {
    console.log("Problem s konfiguracijom - Upišite Vaš Recaptcha Tajni ključ")
    return false
  }
  return true;
}

function RegexProvjera(appStranicenje, jwtValjanost) {
  const samoBrojeviRegex = /^\d+$/;
  const stranicenjeBroj = samoBrojeviRegex.test(appStranicenje);
  const valjanostBroj = samoBrojeviRegex.test(jwtValjanost);
  if (stranicenjeBroj || valjanostBroj)
    return true;
  else {
    console.log("Problem s konfiguracijom - Pogreška kod provjere brojeva")
    return false;
  }
}


export function ProvjeriKonfiguraciju(konf) {
  const appStranicenje = parseInt(konf.appStranicenje);
  const jwtValjanost = parseInt(konf.jwtValjanost);
  const jwtTajniKljuc = konf.jwtTajniKljuc;
  const tajniKljucSesija = konf.tajniKljucSesija;
  const tmdbApiKeyV3 = konf.tmdbApiKeyV3;
  const tmdbApiKeyV4 = konf.tmdbApiKeyV4;
  const githubKlijentKljuc = konf.githubKlijentKljuc;
  const githubTajniKljuc = konf.githubTajniKljuc;
  const recaptchaKljuc = konf.recaptchaSiteKljuc;
  const recaptchaTajniKljuc = konf.recaptchaTajniKljuc;

  var provjera = true;

  if (
    !ProvjeriStranicenje(appStranicenje)
    || !ProvjeriJwtValjanost(jwtValjanost)
    || !ProvjeriJwtTajniKljuc(jwtTajniKljuc)
    || !ProvjeriTajniKljucSesija(tajniKljucSesija)
    || !ProvjeriTMDBKljuceve(tmdbApiKeyV3, tmdbApiKeyV4)
    || !RegexProvjera(appStranicenje, jwtValjanost)
    || !ProvjeraGithubKlijentKljuc(githubKlijentKljuc)
    || !ProvjeraGithubTajniKljuc(githubTajniKljuc)
    || !ProvjeraRecaptchaKljuc(recaptchaKljuc)
    || !ProvjeraRecaptchaTajniKljuc(recaptchaTajniKljuc)
  ) {
    provjera = false;
  }
  return provjera;
}
