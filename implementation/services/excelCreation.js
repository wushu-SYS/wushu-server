let excel = require('excel4node');

async function createExcelRegisterCompetition(SportsmanData, categoryData) {
    let workbook = new excel.Workbook();
    let option = {
        'sheetView': {
            'rightToLeft': true
        }
    }
    let worksheet = workbook.addWorksheet('sheet1', option);
    let style = {
        font: {
            color: 'black',
            size: 10
        }
    }
    let sportsmenLength = SportsmanData.totalCount;
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
    worksheet.cell(1, 8).string('קטגוריה-3').style(style).style(({font: {bold: true}}));
    worksheet.row(1).freeze(); // Freezes the top four rows

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
            worksheet.cell(rowCell, 6).string(sportsmenArr[i].category ? categoryMap.get(parseInt(sportsmenArr[i].category)) : "").style(style);
            sportsMap.set(parseInt(sportsmenArr[i].id), {row: rowCell, col: 7});
            i++;
            rowCell++;
            console.log(sportsMap)
        } else {
            let row = sportsMap.get(sportsmenArr[i].id).row;
            let col = sportsMap.get(sportsmenArr[i].id).col;
            worksheet.cell(row, col).string(sportsmenArr[i].category ? categoryMap.get(parseInt(sportsmenArr[i].category)) : "").style(style);
            sportsMap.delete(sportsmenArr[i].id);
            sportsMap.set(parseInt(sportsmenArr[i].id), {row: row, col: 8})

            i++;
        }
    }

    await workbook.write('רישום ספורטאים לתחרות.xlsx');


    return 'רישום ספורטאים לתחרות.xlsx';


}
async function createExcelRegisterSportsman(clubList) {
    let workbook = new excel.Workbook();
    let option = {
        'sheetView': {
            'rightToLeft': true
        }
    }
    let worksheet = workbook.addWorksheet('sheet1', option);
    let style = {
        font: {
            color: 'black',
            size: 12
        }
    }


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
    let row =2;
    worksheet.cell(1, 26).string("מועדנים").style(style).style({font: {color: 'white'}});
    for (let i = 0; i < clubList.length; i++) {
        worksheet.cell(row, 26).string(clubList[i].name +' ' + setIdCategory(clubList[i])).style(style).style(({
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
        formulas: ['=sheet1!$Z$2:$Z$100'],
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



    await workbook.write('רישום ספורטאים למערכת.xlsx');


    return 'רישום ספורטאים למערכת.xlsx';


}
function getListFromCategory(list) {
    let ans = ''
    console.log(list.length)
    list.f
    for (let i = 0; i < 9; i++) {
        if (list[i].id == 5) continue;
        ans = ans + ',' + list[i].sex + ' ' + list[i].name + ' ' + setAgeCategory(list[i]) + ' ' + setIdCategory(list[i]);
    }
    //ans = ans.substring(0,ans.length-1);
    return (ans);
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


module.exports.createExcelRegisterCompetition = createExcelRegisterCompetition;
module.exports.createExcelRegisterSportsman=createExcelRegisterSportsman;
