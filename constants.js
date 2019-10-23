let userType = {
    MANAGER: 1,
    COACH: 2,
    SPORTSMAN: 3
};
let eventType = {
    competition: 'תחרות',
    event: 'אירוע'
};
let regexHeb = new RegExp("^[\u0590-\u05fe]+$");
let sexEnum = {
    זכר: 111,
    נקבה: 112
}

let sportType = {
    טאולו: 201,
    סנדא: 202,

}
let competitionStatus = {
    close: 'סגור',
    open: 'פתוח',
    regclose: 'רישום סגור'
}

let errorMsg = {
    idSportmanErr: 'ת.ז ספורטאי לא תקינה,נא הכנס תעודת זהות תקינה',
    idCoachErr: 'ת.ז מאמן לא תקינה,נא הכנס תעודת זהות תקינה',
    idSportmanExists: 'ת.ז ספורטאי כבר רשומה במערכת',
    firstNameHeb: 'שם פרטי לא תקין , נא לכתוב שם פרטי בעברית',
    lastNameHeb: 'שם משפחה לא תקין,נא לכתוב שם משפחה בעברית',
    phoneErr: 'פאלפון לא תקין ,נא להכניס מספר בעל 10 ספרות',
    emailErr: 'נא הכנס מייל תקין, לדוגמא example@example.com',
    sportClubErr: 'מספר לא תקין, נא הכנס מספר מזהה של מועדון',
    sexErr: 'נא הכנס מין תקין, זכר/נקבה',
    sportTypeErr: 'נא הכנס ענף תקין, סנדא/טאולו',
    idCoachNotExists: 'ת.ז מאמן לא רשומה במערכת',
    errLoginDetails: 'Access denied. Error in user\'s details',
    accessDenied: 'Access denied',
    failDownload: 'Fail to download resource',
    samePassword: 'הסיסמאות זהות'
}

let msg = {
    passUpdated: 'password update successfully',
    userDeleted :'user deleted successfully',
    registerSuccess: 'register successfully',
    competitionUpdate : 'competition update successfully'
}

let fileName = {
    excelFormatRegisterSportsman: 'אקסל רישום ספורטאיים'
}

let statusCode =  {
    ok : 200,
    created : 201,
    accepted :202,
    badRequest : 400,
    unauthorized :401,
    notFound : 404,
    initialServerError : 500
}

module.exports = {
    competitionStatus: competitionStatus,
    eventType: eventType,
    userType: userType,
    hebRegex: regexHeb,
    sexEnum: sexEnum,
    sportType: sportType,
    errorMsg: errorMsg,
    fileName: fileName,
    msg: msg,
    statusCode : statusCode
};