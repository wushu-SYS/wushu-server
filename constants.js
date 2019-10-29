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
let regexHebWithSpace = new RegExp("^[\u0590-\u05fe _]*[\u0590-\u05fe][\u0590-\u05fe _]*$");
let regexHebrewAndNumbers = new RegExp("^[\u0590-\u05fe0-9 _]*[\u0590-\u05fe0-9][\u0590-\u05fe0-9 _]*$");


let colRegisterUserExcel = {
    idSportsman: 0,
    firstName :1,
    lastName: 2,
    phone: 3,
    address: 4,
    birthDate: 5,
    email: 6,
    sportClub: 7,
    sex: 8,
    sportStyle: 9,
    idCoach: 10,


};
let sexEnum = {
    זכר: 111,
    נקבה: 112
};

let sportType = {
    טאולו: 201,
    סנדא: 202,

};
let competitionStatus = {
    close: 'סגור',
    open: 'פתוח',
    regclose: 'רישום סגור'
};

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
    samePassword: 'הסיסמא שהוזנה זהה לסיסמא הנוכחית',
    compAgeErr: 'גיל לא חוקי',
    minAgeErr: 'גיל מינימאלי חייב להיות קטן מגיל מאקסימלי',
    hebErr: 'נא הכנס טקסט בעברית',
    addressErr: 'אנא הכנס כתובת חוקית בעברית'
}

let msg = {
    passUpdated: 'password update successfully',
    userDeleted: 'user deleted successfully',
    registerSuccess: 'register successfully',
    competitionUpdate: 'competition update successfully',
    addCategory: 'category added successfully',
    closeRegistration: 'Register have been closed',
    updateUserDetails: 'user details update successfully',
    categoryRegistrationSuccess: ' add to user category successfully',
    eventAdded: 'event have been created successfully',
    profilePicUpdate: 'profile picture updated successfully'

}

let fileName = {
    excelFormatRegisterSportsman: 'אקסל רישום ספורטאיים'
}

let statusCode = {
    ok: 200,
    created: 201,
    accepted: 202,
    badRequest: 400,
    unauthorized: 401,
    notFound: 404,
    Conflict: 409,
    initialServerError: 500
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
    statusCode: statusCode,
    regexHebrewAndNumbers: regexHebrewAndNumbers,
    regexHebWithSpace: regexHebWithSpace,
    colRegisterUserExcel :colRegisterUserExcel
};