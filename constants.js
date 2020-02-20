let userType = {
    MANAGER: 1,
    COACH: 2,
    SPORTSMAN: 3,
    JUDGE: 4
};
let eventType = {
    competition: 'תחרות',
    event: 'אירוע'
};

let databaseUserTableName = {
    manager : "user_Manger",
    coach :"user_Coach",
    sportsman : "user_Sportsman",
    judge : "user_Judge"
}

let constRegex = {
    regexHeb: new RegExp("^[\u0590-\u05FF ,.'-]+$"),
    regexHebrewAndNumbers: new RegExp("^[\u0590-\u05FF\0-9 ,.'-]+$"),
    regexDate: new RegExp(("(^(((0[1-9]|1[0-9]|2[0-8])[\/](0[1-9]|1[012]))|((29|30|31)[\/](0[13578]|1[02]))|((29|30)[\/](0[4,6,9]|11)))[\/](19|[2-9][0-9])\d\d$)|(^29[\/]02[\/](19|[2-9][0-9])(00|04|08|12|16|20|24|28|32|36|40|44|48|52|56|60|64|68|72|76|80|84|88|92|96)$)"))
};

let defaultProfilePic = '/profilePics/defalutProfileImg.jpg'
let excelCompetitionEroorMsg = {
    sameCategory: 'קטגוריות זהות',
    ageFail: 'הספורטאי לא בטווח הגילאים של הקטגוריה',
    sexFail: 'מין הספורטאי לא תואם לקטגוריה',
    category: 'קטגוריה'
}
let colRegisterCompetitionExcel = {
    idSportsman: 0,
    firstName: 1,
    lastName: 2,
    sex: 3,
    age: 4,
    category1: 5,
    category2: 6,
    category3: 7,
}
let colRegisterJudgeExcel = {
    id: 0,
    firstName: 1,
    lastName: 2,
    phone: 3,
    email: 4,
    numCell: 5
}
let colRegisterSportsmanExcel = {
    idSportsman: 0,
    firstName: 1,
    lastName: 2,
    phone: 3,
    address: 4,
    birthDate: 5,
    email: 6,
    sportClub: 7,
    sex: 8,
    sportStyle: 9,
    idCoach: 10,
    numCell: 11

}

let colRegisterCoachExcel = {
    idCoach: 0,
    firstName: 1,
    lastName: 2,
    phone: 3,
    address: 4,
    email: 5,
    birthDate: 6,
    sportClub: 7,
    numCell: 8
};

let sexEnum = {
    זכר: 111,
    נקבה: 112
};
let sexEnumCompetition = {
    זכר: 111,
    נקבה: 112,
    מעורב: 113
};

let sportType = {
    טאולו: 201,
    סנדא: 202,

};

let sportsManMandatoryFields = ["Id", "FirstName", "LastName", "Phone", "Address", "BirthDate", "Email", "IdCoach", "Sex", "SportStyle", "SportClub"];
let sportsManFields = {
    idErr: "ת.ז. הינו שדה חובה",
    firstNameErr: "שם פרטי הינו שדה חובה",
    lastNameErr: "שם משפחה הינו שדה חובה",
    phoneErr: "טלפון הינו שדה חובה",
    addressErr: "כתובת הינו שדה חובה",
    birthDateErr: "תאריך לידה הינו שדה חובה",
    emailErr: "איימיל הינו שדה חובה",
    idCoachErr: "מאמן הינו שדה חובה",
    sexErr: "מין הינו שדה חובה",
    sportStyleErr: "ענף הינו שדה חובה",
    sportClubErr: "מועדון הינו שדה חובה"
};


let competitionStatus = {
    close: 'סגור',
    open: 'פתוח',
    regclose: 'רישום סגור'
};

let userError = {
    idErr: 'ת.ז לא תקינה,נא הכנס תעודת זהות תקינה',
    firstNameHebErr: 'שם פרטי לא תקין , נא לכתוב שם פרטי בעברית',
    lastNameHebErr: 'שם משפחה לא תקין,נא לכתוב שם משפחה בעברית',
    addressErr: 'אנא הכנס כתובת חוקית בעברית',
    phoneErr: 'פאלפון לא תקין ,נא להכניס מספר בעל 10 ספרות',
    emailErr: 'נא הכנס מייל תקין, לדוגמא example@example.com',
    sexErr: 'נא הכנס מין תקין, זכר/נקבה',
    sportTypeErr: 'נא הכנס ענף תקין, סנדא/טאולו',
    idCoachErr: 'ת.ז מאמן לא תקינה,נא הכנס תעודת זהות תקינה',
    sportClubErr: 'מספר מזהה מועדון לא תקין',
    birthDateErr: 'תאריך לידה לא תקין '

}
let errorMsg = {

    idSportmanExists: 'ת.ז ספורטאי כבר רשומה במערכת',
    firstNameHeb: 'שם פרטי לא תקין , נא לכתוב שם פרטי בעברית',
    lastNameHeb: 'שם משפחה לא תקין,נא לכתוב שם משפחה בעברית',
    idCoachNotExists: 'ת.ז מאמן לא רשומה במערכת',
    errLoginDetails: 'Access denied. Error in user\'s details',
    accessDenied: 'Access denied',
    failDownload: 'Fail to download resource',
    samePassword: 'הסיסמא שהוזנה זהה לסיסמא הנוכחית',
    compAgeErr: 'גיל לא חוקי',
    minAgeErr: 'גיל מינימאלי חייב להיות קטן מגיל מקסימלי',
    hebErr: 'נא הכנס טקסט בעברית',
    idNotMatchName: 'ת.ז ספורטאי לא תואמת לשם שלו',
    emptyExcel: 'קובץ ריק',
    cellEmpty: 'אנא מלא את כל התאים',
    birthDateErr: 'תאריך לידה לא תקין',
    sportClubContactPhoneErr: 'טלפון איש קשר לא תקין'
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
    clubAdded: 'sport club have been created successfully',
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
    statusCode: statusCode,
    sportsManMandatoryFields: sportsManMandatoryFields,
    competitionStatus: competitionStatus,
    eventType: eventType,
    userType: userType,
    sexEnum: sexEnum,
    sexEnumCompetition: sexEnumCompetition,
    sportType: sportType,
    errorMsg: errorMsg,
    fileName: fileName,
    msg: msg,
    constRegex: constRegex,
    colRegisterSportsmanExcel: colRegisterSportsmanExcel,
    colRegisterCompetitionExcel: colRegisterCompetitionExcel,
    userError: userError,
    sportsManFields: sportsManFields,
    excelCompetitionEroorMsg: excelCompetitionEroorMsg,
    defaultProfilePic: defaultProfilePic,
    colRegisterCoachExcel: colRegisterCoachExcel,
    colRegisterJudgeExcel: colRegisterJudgeExcel,
    databaseUserTableName:databaseUserTableName,
};
