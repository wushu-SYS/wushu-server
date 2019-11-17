let excel = require('excel4node');
let path = './resources/files/';
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

async function createExcelRegisterCompetition(SportsmanData, categoryData) {
    let workbook = new excel.Workbook();
    workbook.writeP = util.promisify(workbook.write);

    let worksheet = workbook.addWorksheet('sheet1', option);

    let sportsmenLength = SportsmanData.sportsmen.length;
    let sportsmenArr = SportsmanData.sportsmen;
    let categoryMap = new Map();
    worksheet.cell(1, 26).string("קטגוריות").style(style).style({font: {color: 'white'}});
    for (let i = 2; i < categoryData.length; i++) {
        worksheet.cell(i, 26).string(categoryData[i].sex + ' ' + categoryData[i].name + ' ' + setAgeCategory(categoryData[i]) + ' ' + setIdCategory(categoryData[i])).style(style).style(({
            font: {color: 'white'},
            alignment: {horizontal: 'right'}
        }));
        categoryMap.set(categoryData[i].id, (categoryData[i].sex + ' ' + categoryData[i].name + ' ' + setAgeCategory(categoryData[i]) + ' ' + setIdCategory(categoryData[i])))
    }
    let sportsMap = new Map();
    worksheet.cell(1, 1).string('ת.ז ספורטאי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 2).string('שם פרטי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 3).string('שם משפחה').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 4).string('מין').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 5).string('גיל').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 6).string('קטגוריה-1').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 7).string('קטגוריה-2').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 8).string('קטגוריה-3').style(style).style(({font: {bold: true},}));
    worksheet.row(1).freeze(); // Freezes the top four rows
    lockValueCell(worksheet,'A',1);
    lockValueCell(worksheet,'B',1);
    lockValueCell(worksheet,'C',1);
    lockValueCell(worksheet,'D',1);
    lockValueCell(worksheet,'E',1);
    lockValueCell(worksheet,'F',1);
    lockValueCell(worksheet,'G',1);
    lockValueCell(worksheet,'H',1);


    worksheet.column(6).setWidth(25);
    worksheet.column(7).setWidth(25);
    worksheet.column(8).setWidth(25);
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
            lockValueCell(worksheet,'A',rowCell);
            lockValueCell(worksheet,'B',rowCell);
            lockValueCell(worksheet,'C',rowCell);
            lockValueCell(worksheet,'D',rowCell);
            lockValueCell(worksheet,'E',rowCell);
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

    lockCell(worksheet,"I1:I"+(rowCell*100));
    lockCell(worksheet,"J1:J"+(rowCell*100));
    lockCell(worksheet,"K1:K"+(rowCell*100));
    lockCell(worksheet,"L1:L"+(rowCell*100));
    lockCell(worksheet,"A"+rowCell+":A"+(rowCell*100));
    lockCell(worksheet,"B"+rowCell+":B"+(rowCell*100));
    lockCell(worksheet,"C"+rowCell+":C"+(rowCell*100));
    lockCell(worksheet,"D"+rowCell+":D"+(rowCell*100));
    lockCell(worksheet,"E"+rowCell+":E"+(rowCell*100));
    lockCell(worksheet,"F"+rowCell+":F"+(rowCell*100));
    lockCell(worksheet,"G"+rowCell+":G"+(rowCell*100));
    lockCell(worksheet,"H"+rowCell+":H"+(rowCell*100));

    fileName = 'רישום ספורטאים לתחרות.xlsx';
    return writeExcel(workbook, (path + fileName))


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
const lockValueCell =(worksheet, range,rowCell) => {
    worksheet.addDataValidation({
        type: 'custom',
        allowBlank: false,
        error: 'אינך יכול לשנות תא זה.',
        sqref: range+rowCell,
        formulas: [range+rowCell],
        style: style,

    });

}
async function createExcelRegisterSportsman(clubList,coachList) {
    let workbook = new excel.Workbook();
    workbook.writeP = util.promisify(workbook.write);

    let worksheet = workbook.addWorksheet('sheet1', option);



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
    lockValueCell(worksheet,'A',1);
    lockValueCell(worksheet,'B',1);
    lockValueCell(worksheet,'C',1);
    lockValueCell(worksheet,'D',1);
    lockValueCell(worksheet,'E',1);
    lockValueCell(worksheet,'F',1);
    lockValueCell(worksheet,'G',1);
    lockValueCell(worksheet,'H',1);
    lockValueCell(worksheet,'I',1);
    lockValueCell(worksheet,'J',1);
    lockValueCell(worksheet,'K',1);
    let row = 2;

    worksheet.cell(1, 26).string("מועדנים").style(style).style({font: {color: 'white'}});
    for (let i = 0; i < clubList.length; i++) {
        worksheet.cell(row, 26).string(clubList[i].name + ' ' + setIdCategory(clubList[i])).style(style).style(({
            font: {color: 'white'},
            alignment: {horizontal: 'right'}
        }));
        row++;
    }
    row =2 ;
    worksheet.cell(1, 27).string("מאמנים").style(style).style({font: {color: 'white'}});
    for (let i = 0; i < coachList.length; i++) {
        worksheet.cell(row, 27).string(coachList[i].firstname + ' ' + coachList[i].lastname + ' ' +setIdCoach(coachList[i])).style(style).style(({
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
        prompt: 'בחר מועדון',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'K2:K100',
        formulas: ['=sheet1!$AA$2:$AA$'+(coachList.length+1)],
        style: style,
    });

    worksheet.addDataValidation({
        type: 'textLength',
        allowBlank: false,
        prompt: 'הכנס ת.ז ספורטאי',
        error: 'ת.ז צריכה להכיל 9 ספרות',
        sqref: 'K2:K100',
        formulas: [9,9],

    });
    worksheet.addDataValidation({
        type: 'textLength',
        allowBlank: false,
        prompt: 'הכנס ת.ז ספורטאי',
        error: 'ת.ז צריכה להכיל 9 ספרות',
        sqref: 'A2:A100',
        formulas: [9,9],

    });
    worksheet.addDataValidation({
        type: 'textLength',
        allowBlank: false,
        prompt: 'הכנס פאלפון',
        error: 'פאלפון צריך להכיל 10 ספרות',
        sqref: 'D2:D100',
        formulas: [10,10],

    });
    worksheet.addDataValidation({
        type: 'list',
        allowBlank: false,
        prompt: 'בחר מועדון',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'H2:H100',
        formulas: ['=sheet1!$Z$2:$Z$'+(clubList.length+1)],
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
        formulas: ['טאולו,סנדא'],
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

    lockCell(worksheet,'L1:L100')
    lockCell(worksheet,'M1:M100')
    lockCell(worksheet,'N1:N100')
    lockCell(worksheet,'O1:O100')
    lockCell(worksheet,'P1:P100')
    lockCell(worksheet,'Q1:Q100')
    lockCell(worksheet,'R1:R100')

    fileName = 'רישום ספורטאים למערכת.xlsx';
    return writeExcel(workbook, (path + fileName));

}


async function createExcelRegisterCoaches(clubList,){
    let workbook = new excel.Workbook();
    workbook.writeP = util.promisify(workbook.write);
    let worksheet = workbook.addWorksheet('sheet1', option);

    worksheet.cell(1, 1).string('ת.ז מאמן').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 2).string('שם פרטי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 3).string('שם משפחה').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 4).string('פאלאפון').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 5).string('כתובת').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 6).string('אימייל').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 7).string('תאריך לידה').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 8).string('מועדון ספורט').style(style).style(({font: {bold: true}}));
    worksheet.row(1).freeze(); // Freezes the top four rows

    let row =2 ;
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
        formulas: ['=sheet1!$Z$2:$Z$'+(clubList.length+1)],
        style: style,
    });
    worksheet.addDataValidation({
        type: 'textLength',
        allowBlank: false,
        prompt: 'הכנס ת.ז ספורטאי',
        error: 'ת.ז צריכה להכיל 9 ספרות',
        sqref: 'A2:A100',
        formulas: [9,9],

    });
    worksheet.addDataValidation({
        type: 'textLength',
        allowBlank: false,
        prompt: 'הכנס פאלפון',
        error: 'פאלפון צריך להכיל 10 ספרות',
        sqref: 'D2:D100',
        formulas: [10,10],

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


    lockValueCell(worksheet,'A',1);
    lockValueCell(worksheet,'B',1);
    lockValueCell(worksheet,'C',1);
    lockValueCell(worksheet,'D',1);
    lockValueCell(worksheet,'E',1);
    lockValueCell(worksheet,'F',1);
    lockValueCell(worksheet,'G',1);
    lockValueCell(worksheet,'H',1);

    lockCell(worksheet,'I1:I100')
    lockCell(worksheet,'J1:J100')
    lockCell(worksheet,'K1:K100')
    lockCell(worksheet,'L1:L100')
    lockCell(worksheet,'M1:M100')
    lockCell(worksheet,'N1:N100')
    lockCell(worksheet,'O1:O100')
    lockCell(worksheet,'P1:P100')
    lockCell(worksheet,'Q1:Q100')
    lockCell(worksheet,'R1:R100')


    fileName = 'רישום מאמנים למערכת.xlsx';
    return writeExcel(workbook, (path + fileName));

}


async function createExcelCompetitionState(compState,date) {
    let workbook = new excel.Workbook();
    workbook.writeP = util.promisify(workbook.write);
    let worksheet = workbook.addWorksheet('sheet1', option);



    worksheet.cell(1, 1).string('ת.ז ספורטאי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 2).string('שם פרטי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1, 3).string('שם משפחה').style(style).style(({font: {bold: true}}));
    worksheet.row(1).freeze(); // Freezes the top four rows

    let row = 2;
    let j;
    for (let i = 0; i < compState.length; i++) {
        //worksheet.cell(row, 1).string(compState[i].category.name).style(style).style(({font: {bold: true}}));
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
    let fixDate =date.split('T')[0];
    fixDate=setDateFormat(fixDate)

    fileName = 'מצב רישום תחרות' + ' ' +fixDate + '.xlsx'
    return writeExcel(workbook, (path + fileName));

}


function setDateFormat(date) {
    let initial = date.split("-");
    return ([initial[2], initial[1], initial[0]].join('-'));

}
async function writeExcel(workbook, loc) {
    try {
        let result = await workbook.writeP(loc);
        return loc;
    } catch (e) {
        console.log(e);
    }
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

module.exports.createExcelRegisterCompetition = createExcelRegisterCompetition;
module.exports.createExcelRegisterSportsman = createExcelRegisterSportsman;
module.exports.createExcelCompetitionState = createExcelCompetitionState;
module.exports.createExcelRegisterCoaches=createExcelRegisterCoaches;