exports.provjeriResurs = function (broj, odgovor) {
    const regex = /^[a-zA-Z]+$/;
    if (regex.test(broj)) {
        return false;
    } else {
        return true;
    }
}


exports.provjeriResursDnevnika = function (resurs) {
    if (resurs != "d" && resurs != "m")
        return false;
    else
        return true;
}