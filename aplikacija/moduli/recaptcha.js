exports.provjeraRecaptcha = async function (token, recaptchaTajniKljuc) {
    let parametri = { method: 'POST' }
    let o = await fetch("https://www.google.com/recaptcha/api/siteverify?secret="
        + recaptchaTajniKljuc + "&response=" + token, parametri);
    let recaptchaStatus = JSON.parse(await o.text());
    console.log(recaptchaStatus)
    if (recaptchaStatus.success && recaptchaStatus.score > 0.5)
        return true;
    return false;
}