const common_func = require("../commonFunc")
let excel = require('excel4node');
let path = './resources/';
let fileName;
const util = require('util');
let option = {
    'sheetView': {
        'rightToLeft': true
    }
};
let style = {
    font: {
        color: 'black',
        size: 12
    }
}

function createWorkBook() {
    let workbook = new excel.Workbook();
    workbook.writeP = util.promisify(workbook.write);
    let worksheet = workbook.addWorksheet('sheet1', option);
    return {workbook, worksheet};
}


async function createExcelRegisterSportsman(clubList, coachList) {
    let {workbook, worksheet} = createWorkBook();
    let row = 2;

    worksheet.cell(1, 1).string('ת.ז ספורטאי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 2).string('שם פרטי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 3).string('שם משפחה').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 4).string('פאלפון').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 5).string('כתובת').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 6).string('תאריך לידה').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 7).string('אימייל').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 8).string('מועדון ספורט').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 9).string('מין').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 10).string('ענף').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 11).string('ת.ז מאמן').style(style).style(({font: {bold: true}}));
    worksheet.row(1).freeze(); // Freezes the top four rows


    worksheet.cell(1, 26).string("מועדנים").style(style).style({font: {color: 'white'}});
    for (let i = 0; i < clubList.length; i++) {
        worksheet.cell(row, 26).string(clubList[i].name + ' ' + setIdCategory(clubList[i])).style(style).style(({
            font: {color: 'white'},
            alignment: {horizontal: 'right'}
        }));
        row++;
    }

    row = 2;
    worksheet.cell(1, 27).string("מאמנים").style(style).style({font: {color: 'white'}});
    for (let i = 0; i < coachList.length; i++) {
        worksheet.cell(row, 27).string(coachList[i].firstname + ' ' + coachList[i].lastname + ' ' + setIdCoach(coachList[i])).style(style).style(({
            font: {color: 'white'},
            alignment: {horizontal: 'right'}
        }));
        row++;
    }

    for (let i = 2; i < 1000; i++) {
        worksheet.cell(i, 4).style(style).style(({
            font: {color: 'black'},
            alignment: {horizontal: 'right'},
            numberFormat: '@'
        }));
    }

    worksheet.addDataValidation({
        type: 'list',
        allowBlank: false,
        prompt: 'בחר מאמן',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'K2:K100',
        formulas: ['=sheet1!$AA$2:$AA$' + (coachList.length + 1)],
        style: style,
    });
    worksheet.addDataValidation({
        type: 'textLength',
        allowBlank: false,
        prompt: 'הכנס ת.ז ספורטאי',
        error: 'ת.ז צריכה להכיל 9 ספרות',
        sqref: 'A2:A100',
        formulas: [9, 9],

    });
    worksheet.addDataValidation({
        type: 'textLength',
        allowBlank: false,
        prompt: 'הכנס פאלפון',
        error: 'פאלפון צריך להכיל 10 ספרות',
        sqref: 'D2:D100',
        formulas: [10, 10],

    });
    worksheet.addDataValidation({
        type: 'list',
        allowBlank: false,
        prompt: 'בחר מועדון',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'H2:H100',
        formulas: ['=sheet1!$Z$2:$Z$' + (clubList.length + 1)],
        style: style,
    });
    worksheet.addDataValidation({
        type: 'list',
        allowBlank: false,
        prompt: 'בחר מין',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'I2:I100',
        formulas: ['זכר,נקבה'],
        style: style,
    });
    worksheet.addDataValidation({
        type: 'list',
        allowBlank: false,
        prompt: 'בחר ענף',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'J2:J100',
        formulas: ['טאולו,סנדא,משולב'],
        style: style,
    });
    worksheet.addDataValidation({
        type: 'date',
        allowBlank: false,
        prompt: 'כתוב תאריך לידה בפורמט dd/mm/yyyy',
        error: 'פורמט תאריך צריך להיות dd/mm/yyyy',
        sqref: 'F2:F100',
        style: {
            dateFormat: 'dd/mm/yyyy',
        },
    });

    lockListCell(worksheet, ["L1:L100", "M1:M100", "N1:N100", "O1:O100", "P1:P100", "Q1:Q100", "R1:R100", "S1:S100", "T1:T100", "Q1:Q100", "Z1:Z100", "W1:W100", "X1:X100", "Y1:Y100"]);
    lockListValueCell(worksheet, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'], 1);

    fileName = 'רישום ספורטאים למערכת.xlsx';
    return writeExcel(workbook, (path + fileName));

}

async function createExcelRegisterCoaches(clubList) {
    let {workbook, worksheet} = createWorkBook();

    worksheet.cell(1, 1).string('ת.ז מאמן').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 2).string('שם פרטי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 3).string('שם משפחה').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 4).string('פאלאפון').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 5).string('כתובת').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 6).string('אימייל').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 7).string('תאריך לידה').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 8).string('מועדון ספורט').style(style).style(({font: {bold: true}}));
    worksheet.row(1).freeze(); // Freezes the top four rows

    let row = 2;
    worksheet.cell(1, 26).string("מועדנים").style(style).style({font: {color: 'white'}});
    for (let i = 0; i < clubList.length; i++) {
        worksheet.cell(row, 26).string(clubList[i].name + ' ' + setIdCategory(clubList[i])).style(style).style(({
            font: {color: 'white'},
            alignment: {horizontal: 'right'}
        }));
        row++;
    }
    worksheet.addDataValidation({
        type: 'list',
        allowBlank: false,
        prompt: 'בחר מועדון',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'H2:H100',
        formulas: ['=sheet1!$Z$2:$Z$' + (clubList.length + 1)],
        style: style,
    });
    worksheet.addDataValidation({
        type: 'textLength',
        allowBlank: false,
        prompt: 'הכנס ת.ז מאמן',
        error: 'ת.ז צריכה להכיל 9 ספרות',
        sqref: 'A2:A100',
        formulas: [9, 9],

    });
    worksheet.addDataValidation({
        type: 'textLength',
        allowBlank: false,
        prompt: 'הכנס פאלפון',
        error: 'פאלפון צריך להכיל 10 ספרות',
        sqref: 'D2:D100',
        formulas: [10, 10],

    });
    worksheet.addDataValidation({
        type: 'date',
        allowBlank: false,
        prompt: 'כתוב תאריך לידה בפורמט dd/mm/yyyy',
        error: 'פורמט תאריך צריך להיות dd/mm/yyyy',
        sqref: 'G2:G100',
        style: {
            dateFormat: 'dd/mm/yyyy',
        },
    });

    lockListValueCell(worksheet, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 1);
    lockListCell(worksheet, ["I1:I100", "J1:J100", "K1:K100", "L1:L100", "M1:M100", "N1:N100", "O1:O100", "P1:P100", "Q1:Q100", "R1:R100", "S1:S100", "T1:T100", "Z1:Z100", "W1:W100", "X1:X100", "Y1:Y100"]);

    fileName = 'רישום מאמנים למערכת.xlsx';
    return writeExcel(workbook, (path + fileName));

}

async function createExcelRegisterNewJudge() {
    let {workbook, worksheet} = createWorkBook();

    worksheet.cell(1, 1).string('ת.ז שופט').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 2).string('שם פרטי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 3).string('שם משפחה').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 4).string('פאלאפון').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 5).string('אימייל').style(style).style(({font: {bold: true}}));
    worksheet.row(1).freeze();

    worksheet.addDataValidation({
        type: 'textLength',
        allowBlank: false,
        prompt: 'הכנס ת.ז שופט',
        error: 'ת.ז צריכה להכיל 9 ספרות',
        sqref: 'A2:A100',
        formulas: [9, 9],

    });
    worksheet.addDataValidation({
        type: 'textLength',
        allowBlank: false,
        prompt: 'הכנס פאלפון',
        error: 'פאלפון צריך להכיל 10 ספרות',
        sqref: 'D2:D100',
        formulas: [10, 10],

    });

    lockListValueCell(worksheet, ['A', 'B', 'C', 'D', 'E'], 1);
    lockListCell(worksheet, ["F1:F100", "G1:G100", "H1:H100", "I1:I100", "J1:J100", "K1:K100", "L1:L100", "M1:M100", "N1:N100", "O1:O100", "P1:P100", "Q1:Q100", "R1:R100", "T1:T100", "Z1:Z100", "W1:W100", "X1:X100", "Y1:Y100"]);


    fileName = 'רישום שופטים למערכת.xlsx';
    return writeExcel(workbook, (path + fileName));
}

async function createExcelCoachAsJudge(coachList) {
    let {workbook, worksheet} = createWorkBook();

    worksheet.cell(1, 1).string('ת.ז מאמן').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 2).string('שם פרטי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 3).string('שם משפחה').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 4).string('הפוך לשופט').style(style).style(({font: {bold: true}}));
    worksheet.row(1).freeze();

    let row = 2;
    for (let i = 0; i < coachList.length; i++) {
        worksheet.cell(row, 1).number(coachList[i].id).style(style);
        worksheet.cell(row, 2).string(coachList[i].firstname).style(style);
        worksheet.cell(row, 3).string(coachList[i].lastname).style(style);
        lockListValueCell(worksheet, ['A', 'B', 'C'], row)
        row++;
    }


    lockListValueCell(worksheet, ['A', 'B', 'C', 'D'], 1);
    lockListCell(worksheet, ["E1:E100", "F1:F100", "G1:G100", "H1:H100", "I1:I100", "J1:J100", "K1:K100", "L1:L100", "M1:M100", "N1:N100", "O1:O100", "P1:P100", "Q1:Q100", "R1:R100", "T1:T100", "Z1:Z100", "W1:W100", "X1:X100", "Y1:Y100"]);
    worksheet.addDataValidation({
        type: 'list',
        allowBlank: false,
        prompt: 'הפוך לשופט ?',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'D2:D100',
        formulas: ['כן'],
        style: style,
    });


    fileName = 'שיוך מאמנים כשופטים במערכת.xlsx';
    return writeExcel(workbook, (path + fileName));

}


async function createExcelCompetitionState(compState, date) {
    let {workbook, worksheet} = createWorkBook();


    worksheet.cell(1, 1).string('ת.ז ספורטאי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 2).string('שם פרטי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 3).string('שם משפחה').style(style).style(({font: {bold: true}}));
    worksheet.row(1).freeze(); // Freezes the top four rows

    let row = 2;
    let j;
    for (let i = 0; i < compState.length; i++) {
        worksheet.cell(row, 1, row, 3, true).string(compState[i].category.name).style(style).style(({
            font: {bold: true},
            alignment: {horizontal: 'center'},
            fill: {
                type: 'pattern',
                patternType: 'solid',
                fgColor: '2172d7',
                // bgColor: 'ffffff'
            }
        }));
        row++;
        let users = compState[i].users;
        for (j = 0; j < users.length; j++) {

            worksheet.cell(row, 1).number(users[j].id).style(style);
            worksheet.cell(row, 2).string(users[j].firstname).style(style);
            worksheet.cell(row, 3).string(users[j].lastname).style(style);
            row++
        }
    }
    let fixDate = date.split('T')[0];
    fixDate = setDateFormat(fixDate)

    fileName = 'מצב רישום תחרות' + ' ' + fixDate + '.xlsx'
    return writeExcel(workbook, (path + fileName));

}

async function createExcelRegisterCompetition(SportsmanData, categoryData) {
    let {workbook, worksheet} = createWorkBook();

    let sportsmenLength = SportsmanData.sportsmen.length;
    let sportsmenArr = SportsmanData.sportsmen;
    let categoryMap = new Map();
    let sportsMap = new Map();

    worksheet.cell(1, 26).string("קטגוריות").style(style).style({font: {color: 'white'}});
    for (let i = 2; i < categoryData.length; i++) {
        worksheet.cell(i, 26).string(categoryData[i].sex + ' ' + categoryData[i].name + ' ' + setAgeCategory(categoryData[i]) + ' ' + setIdCategory(categoryData[i])).style(style).style(({
            font: {color: 'white'},
            alignment: {horizontal: 'right'}
        }));
        categoryMap.set(categoryData[i].id, (categoryData[i].sex + ' ' + categoryData[i].name + ' ' + setAgeCategory(categoryData[i]) + ' ' + setIdCategory(categoryData[i])))
    }

    worksheet.cell(1, 1).string('ת.ז ספורטאי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 2).string('שם פרטי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 3).string('שם משפחה').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 4).string('מין').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 5).string('גיל').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 6).string('קטגוריה-1').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 7).string('קטגוריה-2').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 8).string('קטגוריה-3').style(style).style(({font: {bold: true},}));
    worksheet.row(1).freeze();

    lockListCell(worksheet, ["L1:L100", "M1:M100", "N1:N100", "O1:O100", "P1:P100", "Q1:Q100", "R1:R100"]);
    lockListValueCell(worksheet, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 1);
    setWidthListCell(worksheet, [6, 7, 8], 25)

    worksheet.addDataValidation({
        type: 'list',
        allowBlank: false,
        prompt: 'בחר קטגוריה',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'F2:F' + (sportsmenLength + 1),
        formulas: ['=sheet1!$Z$2:$Z$100'],
        style: style,
    });
    worksheet.addDataValidation({
        type: 'list',
        allowBlank: false,
        prompt: 'בחר קטגוריה',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'G2:G' + (sportsmenLength + 1),
        formulas: ['=sheet1!$Z$2:$Z$100'],
        style: style,

    });
    worksheet.addDataValidation({
        type: 'list',
        allowBlank: false,
        prompt: 'בחר קטגוריה',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'H2:H' + (sportsmenLength + 1),
        formulas: ['=sheet1!$Z$2:$Z$100'],
        style: style,

    });

    sportsmenArr.sort(function (a, b) {
        if (a.sex === b.sex) {
            return a.age - b.age;
        }
        return a.sex > b.sex ? 1 : -1;
    });

    let i = 0;
    let rowCell = 2;
    while (i < sportsmenLength) {
        if (sportsMap.has(sportsmenArr[i].id) == false) {
            worksheet.cell(rowCell, 1).number(sportsmenArr[i].id).style(style);
            worksheet.cell(rowCell, 2).string(sportsmenArr[i].firstname).style(style);
            worksheet.cell(rowCell, 3).string(sportsmenArr[i].lastname).style(style);
            worksheet.cell(rowCell, 4).string(sportsmenArr[i].sex).style(style);
            worksheet.cell(rowCell, 5).number(sportsmenArr[i].age).style(style);
            lockListValueCell(worksheet, ['A', 'B', 'C', 'D', 'E'], rowCell);
            worksheet.cell(rowCell, 6).string(sportsmenArr[i].category ? categoryMap.get(parseInt(sportsmenArr[i].category)) : "").style(style);
            sportsMap.set(parseInt(sportsmenArr[i].id), {row: rowCell, col: 7});
            i++;
            rowCell++;
        } else {
            let row = sportsMap.get(sportsmenArr[i].id).row;
            let col = sportsMap.get(sportsmenArr[i].id).col;
            worksheet.cell(row, col).string(sportsmenArr[i].category ? categoryMap.get(parseInt(sportsmenArr[i].category)) : "").style(style);
            sportsMap.delete(sportsmenArr[i].id);
            sportsMap.set(parseInt(sportsmenArr[i].id), {row: row, col: 8});
            i++;
        }
    }

    let endRow = rowCell * 100;
    lockListCell(worksheet, ["I1:I" + endRow, "J1:J" + endRow, "K1:K" + endRow, "L1:L" + endRow, "A" + rowCell + ":A" + endRow,
        "B" + rowCell + ":B" + endRow, "C" + rowCell + ":C" + endRow, "D" + rowCell + ":D" + endRow, "E" + rowCell + ":E" + endRow,
        "F" + rowCell + ":F" + endRow, "G" + rowCell + ":G" + endRow, "H" + rowCell + ":H" + endRow]);

    fileName = 'רישום ספורטאים לתחרות.xlsx';
    return writeExcel(workbook, (path + fileName))


}

async function createSportsmenExcel(sportsmen) {
    let {workbook, worksheet} = createWorkBook();

    worksheet.cell(1, 1).string('ת.ז ספורטאי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 2).string('שם פרטי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 3).string('שם משפחה').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 4).string('מספר תחרויות').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 5).string('מין').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 6).string('גיל').style(style).style(({font: {bold: true}}));
    worksheet.row(1).freeze();

    let row = 2;
    for (i = 0; i < sportsmen.length; i++) {
        worksheet.cell(row, 1).number(sportsmen[i].id).style(style);
        worksheet.cell(row, 2).string(sportsmen[i].firstname).style(style);
        worksheet.cell(row, 3).string(sportsmen[i].lastname).style(style);
        worksheet.cell(row, 4).number(sportsmen[i].competitionCount).style(style);
        worksheet.cell(row, 5).string(sportsmen[i].sex).style(style);
        worksheet.cell(row, 6).number(sportsmen[i].age).style(style);
        row++;
    }

    fileName = 'ייצוא ספורטאיים' + '.xlsx';
    return writeExcel(workbook, (path + fileName));
}

async function createCoachExcel(coaches) {
    let {workbook, worksheet} = createWorkBook();

    worksheet.cell(1, 1).string('ת.ז מאמן').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 2).string('שם פרטי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 3).string('שם משפחה').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 4).string('טלפון').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 5).string('אימייל').style(style).style(({font: {bold: true}}));
    worksheet.row(1).freeze();

    let row = 2;
    for (i = 0; i < coaches.length; i++) {
        worksheet.cell(row, 1).number(coaches[i].id).style(style);
        worksheet.cell(row, 2).string(coaches[i].firstname).style(style);
        worksheet.cell(row, 3).string(coaches[i].lastname).style(style);
        worksheet.cell(row, 4).string(coaches[i].phone).style(style);
        worksheet.cell(row, 5).string(coaches[i].email).style(style);
        row++;
    }

    fileName = 'ייצוא מאמנים' + '.xlsx';
    return writeExcel(workbook, (path + fileName));
}

async function createJudgeExcel(judges) {
    let {workbook, worksheet} = createWorkBook();

    worksheet.cell(1, 1).string('ת.ז שופט').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 2).string('שם פרטי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 3).string('שם משפחה').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 4).string('טלפון').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 5).string('אימייל').style(style).style(({font: {bold: true}}));
    worksheet.row(1).freeze();

    let row = 2;
    for (i = 0; i < judges.length; i++) {
        worksheet.cell(row, 1).number(judges[i].id).style(style);
        worksheet.cell(row, 2).string(judges[i].firstname).style(style);
        worksheet.cell(row, 3).string(judges[i].lastname).style(style);
        worksheet.cell(row, 4).string(judges[i].phone).style(style);
        worksheet.cell(row, 5).string(judges[i].email).style(style);
        row++;
    }

    fileName = 'ייצוא שופטים' + '.xlsx';
    return writeExcel(workbook, (path + fileName));
}

async function createCompetitionUploadGrade(sportsman, judges, idComp) {
    let {workbook, worksheet} = createWorkBook();
    let row = 2;

    worksheet.cell(1, 1).string('ת.ז ספורטאי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 2).string('שם פרטי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 3).string('שם משפחה').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 4).string('קטגוריה').style(style).style(({font: {bold: true}}));
    lockListValueCell(worksheet, ['A', 'B', 'C', 'D'], 1);
    setWidthListCell(worksheet, [4], 30);
    let i = 0, j = 0, numOfRows = 0;

    while (i < sportsman.length) {
        j = 0;
        let users = sportsman[i].users
        while (j < users.length) {
            worksheet.cell(row, 1).number(users[j].id).style(style);
            worksheet.cell(row, 2).string(users[j].firstname).style(style);
            worksheet.cell(row, 3).string(users[j].lastname).style(style);
            worksheet.cell(row, 4).string(setJudgeCategory(users[j])).style(style);
            lockListValueCell(worksheet, ['A', 'B', 'C', 'D'], row);
            j++
            row++;
        }
        i++;
    }
    numOfRows = row;
    let judgesCharts = []
    i = 5;
    j = 0;
    while (j < judges.length) {
        let char = String.fromCharCode(64 + i);
        lockListCell(worksheet, [`${char}${numOfRows}:${char}100`]);
        judgesCharts.push(char)
        worksheet.cell(1, i).string(setIdJudge(judges[j])).style(style).style(({font: {bold: true}}));
        lockListValueCell(worksheet, [char], 1)
        setWidthListCell(worksheet, [i], 30);
        let sqref = char + '2:' + char + numOfRows
        worksheet.addDataValidation({
            type: 'decimal',
            operator: 'between',
            allowBlank: false,
            error: 'אנא הכנס ציון תקין',
            sqref: sqref,
            formulas: [1, 10],

        });
        j++
        i++
    }

    let char = String.fromCharCode(64 + i);
    worksheet.cell(1, i).string('ציון סופי').style(style).style(({font: {bold: true}}));
    lockListValueCell(worksheet, [char], 1);
    lockListCell(worksheet, [`${char}${numOfRows}:${char}100`]);

    worksheet.row(1).freeze(); // Freezes the top four rows

    for (row = 2; row < numOfRows; row++) {
        let cells = ""
        judgesCharts.forEach((char) => {
            cells = cells + char + row + ","
        })
        cells = cells.substring(0, cells.length - 1);
        worksheet.cell(row, i).formula('AVERAGE(' + cells + ')').style(style)
        lockListValueCell(worksheet, [char], row);
        cells = ""
    }
    i++;
    while (64 + i != 90) {
        let char = String.fromCharCode(64 + i);
        lockListCell(worksheet, [`${char}1:${char}100`]);
        i++;
    }

    lockListCell(worksheet, [`A${row}:A100`, `B${row}:B100`, `C${row}:C100`, `D${row}:D100`]);
    fileName = 'הזנת ציון לתחרות טאלו' + " " + idComp + ".xlsx"
    return writeExcel(workbook, (path + fileName));
}

async function writeExcel(workbook, loc) {
    try {
        let result = await workbook.writeP(loc);
        return loc;
    } catch (e) {
        console.log(e);
    }
}


const lockCell = (worksheet, range) => {
    worksheet.addDataValidation({
        type: "textLength",
        error: "This cell is locked",
        operator: "equal",
        sqref: range,
        formulas: [""],
    });
};
const lockValueCell = (worksheet, range, rowCell) => {
    worksheet.addDataValidation({
        type: 'custom',
        allowBlank: false,
        error: 'אינך יכול לשנות תא זה.',
        sqref: range + rowCell,
        formulas: [range + rowCell],
        style: style,

    });

};
const lockListCell = (worksheet, list) => {
    list.forEach((c) => {
        lockCell(worksheet, c);
    })
};
const lockListValueCell = (worksheet, list, rowNum) => {
    list.forEach((c) => {
        lockValueCell(worksheet, c, rowNum);
    })
};
const setWidthListCell = (worksheet, list, width) => {
    list.forEach((col) => {
        worksheet.column(col).setWidth(width);
    })
}

function setAgeCategory(category) {
    if (category.maxAge == null)
        return category.minAge != 0 ? category.minAge + '+' : '';
    else
        return category.minAge + '-' + category.maxAge;
};

function setIdCategory(category) {
    return '(קוד: ' + category.id + ')';
}

function setIdCoach(id) {
    return '(ת.ז: ' + id.id + ')';
}

function setDateFormat(date) {
    let initial = date.split("-");
    return ([initial[2], initial[1], initial[0]].join('-'));

}

function setIdJudge(judge) {
    let res = judge.firstname + " " + judge.lastname + " " + "(ת.ז " + judge.idJudge + ")"

    return res;
}

function setJudgeCategory(details) {
    return details.categoryName + " " + common_func.getAgeRange(details) + " " + "(id = " + details.category + ")"
}

module.exports.createExcelRegisterCompetition = createExcelRegisterCompetition;
module.exports.createExcelRegisterSportsman = createExcelRegisterSportsman;
module.exports.createExcelCompetitionState = createExcelCompetitionState;
module.exports.createExcelRegisterCoach = createExcelRegisterCoaches;
module.exports.createExcelCoachAsJudge = createExcelCoachAsJudge;
module.exports.createExcelRegisterNewJudge = createExcelRegisterNewJudge;
module.exports.createSportsmenExcel = createSportsmenExcel;
module.exports.createCoachExcel = createCoachExcel;
module.exports.createJudgeExcel = createJudgeExcel;
module.exports.createCompetitionUploadGrade = createCompetitionUploadGrade;
