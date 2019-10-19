
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

var errorMsg ={
    idSportmanErr : 'ת.ז ספורטאי לא תקינה,נא הכנס תעודת זהות תקינה',
    idCoachErr : 'ת.ז מאמן לא תקינה,נא הכנס תעודת זהות תקינה',
    idSportmanExists : 'ת.ז ספורטאי כבר רשומה במערכת',
    firstNameHeb : 'שם פרטי לא תקין , נא לכתוב שם פרטי בעברית',
    lastNameHeb :'שם משפחה לא תקין,נא לכתוב שם משפחה בעברית',
    phoneErr : 'פאלפון לא תקין ,נא להכניס מספר בעל 10 ספרות',
    emailErr: 'נא הכנס מייל תקין, לדוגמא example@example.com',
    sportClubErr : 'מספר לא תקין, נא הכנס מספר מזהה של מועדון',
    sexErr :'נא הכנס מין תקין, זכר/נקבה',
    sportTypeErr: 'נא הכנס ענף תקין, סנדא/טאולו',
    idCoachNotExists :'ת.ז מאמן לא רשומה במערכת'
}


module.exports = {
    hebRegex: regexHeb,
    sexEnum: sexEnum,
    sportType:sportType,
    errorMsg:errorMsg
};