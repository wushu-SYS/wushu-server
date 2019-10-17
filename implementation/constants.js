
var regexHeb = new RegExp("^[\u0590-\u05fe]+$");
var sexEnum =  {
    זכר :111,
    נקבה :112,
    male: 113,
    female :114
}

var sportType =  {
    טאולו :201,
    סנדא :202,

}

module.exports = {
    hebRegex: regexHeb,
    sexEnum: sexEnum,
    sportType:sportType
};