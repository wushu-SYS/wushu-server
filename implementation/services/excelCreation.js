let excel = require('excel4node');

function createExcelRegisterCompetition(SportsmanData,categoryData) {
    let workbook = new excel.Workbook();
    let option = {
        'sheetView': {
            'rightToLeft': true, // Flag indicating whether the sheet is in 'right to left' display mode. When in this mode, Column A is on the far right, Column B ;is one column left of Column A, and so on. Also, information in cells is displayed in the Right to Left format.
        }
    }
    let worksheet = workbook.addWorksheet('רישום ספורטאים לתחרות',option);
    let styleHeader = workbook.createStyle({
        font: {
            color: 'black',
            size: 12,
            bold : true
        }
    })
    let style = {
        font: {
            color: 'black',
            size: 10
        }
    }
    let sportsmenLength = SportsmanData.totalCount;
    let sportsmenArr = SportsmanData.sportsmen;
    let categoryList = getListFromCategory(categoryData)
    worksheet.cell(1,1).string('ת.ז ספורטאי').style(styleHeader);
    worksheet.cell(1,2).string('שם פרטי').style(styleHeader);
    worksheet.cell(1,3).string('שם משפחה').style(styleHeader);
    worksheet.cell(1,4).string('מין').style(styleHeader);
    worksheet.cell(1,5).string('גיל').style(styleHeader);
    worksheet.cell(1,6).string('קטגוריה').style(styleHeader);
    worksheet.addDataValidation({
        type: 'list',
        allowBlank: true,
        prompt: 'בחר קטגוריה',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'F2:F'+sportsmenLength,
        formulas: [categoryList],
    });

    sportsmenArr.sort(function(a, b) {
            if (a.sex === b.sex) {
                return a.age - b.age;
            }
            return a.sex > b.sex ? 1 : -1;
    });

    for (let i =0;i<sportsmenLength;i++)
    {
        //console.log(sportsmenArr[i]);
        worksheet.cell(i+2,1).number(sportsmenArr[i].id).style(style);
        worksheet.cell(i+2,2).string(sportsmenArr[i].firstname).style(style);
        worksheet.cell(i+2,3).string(sportsmenArr[i].lastname).style(style);
        worksheet.cell(i+2,4).string(sportsmenArr[i].sex).style(style);
        worksheet.cell(i+2,5).number(sportsmenArr[i].age).style(style);
    }
    workbook.write('רישום ספורטאים לתחרות.xlsx');

}

function getListFromCategory(list){
    let ans = ''
    for(let i=0;i<10;i++)
        ans= ans +list[i].name+ ' ' +setAgeCategory(list[i]) +' ' + + ',';
   ans = ans.substring(0,ans.length-1);
    console.log(ans);
    return(ans);
}

function setAgeCategory(category){
    if(category.maxAge == null)
        return category.minAge != 0 ? category.minAge + "+" : "";
    else
        return category.minAge + "-" + category.maxAge;
};



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