let excel = require('excel4node');

async function createExcelRegisterCompetition(SportsmanData,categoryData) {
    let workbook = new excel.Workbook();
    let option = {
        'sheetView': {
            'rightToLeft': true
        }
    }
    let worksheet = workbook.addWorksheet('רישום ספורטאים לתחרות',option);
    let style = {
        font: {
            color: 'black',
            size: 10
        }
    }
    let sportsmenLength = SportsmanData.totalCount;
    let sportsmenArr = SportsmanData.sportsmen;
    let categoryList = getListFromCategory(categoryData)
    worksheet.cell(1,1).string('ת.ז ספורטאי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1,2).string('שם פרטי').style(style).style(({font: {bold: true}}));
    worksheet.cell(1,3).string('שם משפחה').style(style).style(({font: {bold: true}}));
    worksheet.cell(1,4).string('מין').style(style).style(({font: {bold: true}}));
    worksheet.cell(1,5).string('גיל').style(style).style(({font: {bold: true}}));
    worksheet.cell(1,6).string('קטגוריה-1').style(style).style(({font: {bold: true}}));
    worksheet.cell(1,7).string('קטגוריה-2').style(style).style(({font: {bold: true}}));
    worksheet.cell(1,8).string('קטגוריה-3').style(style).style(({font: {bold: true}}));
    worksheet.row(1).freeze(); // Freezes the top four rows

    worksheet.column(6).setWidth(25);
    worksheet.column(7).setWidth(25);
    worksheet.column(8).setWidth(25);
    worksheet.addDataValidation({
        type: 'list',
        allowBlank: true,
        prompt: 'בחר קטגוריה',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'F2:F'+(sportsmenLength+1),
        formulas: [categoryList],
    });
    worksheet.addDataValidation({
        type: 'list',
        allowBlank: true,
        prompt: 'בחר קטגוריה',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'G2:G'+(sportsmenLength+1),
        formulas: [categoryList],
    });
    worksheet.addDataValidation({
        type: 'list',
        allowBlank: true,
        prompt: 'בחר קטגוריה',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'H2:H'+(sportsmenLength+1),
        formulas: [''],
    });

    sportsmenArr.sort(function(a, b) {
            if (a.sex === b.sex) {
                return a.age - b.age;
            }
            return a.sex > b.sex ? 1 : -1;
    });

    for (let i =0;i<sportsmenLength;i++) {
        worksheet.cell(i+2,1).number(sportsmenArr[i].id).style(style);
        worksheet.cell(i+2,2).string(sportsmenArr[i].firstname).style(style);
        worksheet.cell(i+2,3).string(sportsmenArr[i].lastname).style(style);
        worksheet.cell(i+2,4).string(sportsmenArr[i].sex).style(style);
        worksheet.cell(i+2,5).number(sportsmenArr[i].age).style(style);
    }
    //await  workbook.write('רישום ספורטאים לתחרות.xlsx');
     await workbook.write('רישום ספורטאים לתחרות.xlsx', function(err, stats) {
        if (err) {
            console.error(err);
        } else {
            console.log(stats); // Prints out an instance of a node.js fs.Stats object
        }
    });

    return 'רישום ספורטאים לתחרות.xlsx';


}

function getListFromCategory(list){
    let ans = ''
    console.log(list.length)
    list.f
    for(let i=0;i<list.length;i++)
        ans= ans+',' + list[i].sex +' '+ list[i].name+ ' ' +setAgeCategory(list[i])+' '+setIdCategory(list[i]);
   //ans = ans.substring(0,ans.length-1);
    return(ans);
}
function setAgeCategory(category){
    if(category.maxAge == null)
        return category.minAge != 0 ? category.minAge + '+' : '';
    else
        return category.minAge + '-' + category.maxAge;
};
function setIdCategory(category){
    return '(code: ' +category.id+')';
}


module.exports.createExcelRegisterCompetition = createExcelRegisterCompetition;


/*
// Set value of cell A1 to 100 as a number type styled with paramaters of style
worksheet.cell(1,1).number(100).style(style);

// Set value of cell B1 to 300 as a number type styled with paramaters of style
worksheet.cell(1,2).number(200).style(style);

// Set value of cell C1 to a formula styled with paramaters of style
worksheet.cell(1,3).formula('A1 + B1').style(style);

// Set value of cell A2 to 'string' styled with paramaters of style

// Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
worksheet.cell(3,1).bool(true).style(style).style({font: {size: 14}});



 */