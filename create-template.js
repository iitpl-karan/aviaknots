const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Create a new workbook
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Questions');

// Define columns
worksheet.columns = [
  { header: 'question_title', key: 'question_title', width: 50 },
  { header: 'question_type', key: 'question_type', width: 15 },
  { header: 'option_a', key: 'option_a', width: 20 },
  { header: 'option_b', key: 'option_b', width: 20 },
  { header: 'option_c', key: 'option_c', width: 20 },
  { header: 'option_d', key: 'option_d', width: 20 },
  { header: 'answer', key: 'answer', width: 10 },
  { header: 'description', key: 'description', width: 50 }
];

// Add some sample data
worksheet.addRow({
  question_title: 'What is the capital of France?',
  question_type: 'text_only',
  option_a: 'Paris',
  option_b: 'London',
  option_c: 'Berlin',
  option_d: 'Rome',
  answer: 'a',
  description: 'Paris is the capital city of France'
});

worksheet.addRow({
  question_title: 'The Earth is flat.',
  question_type: 'true_false',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  answer: 'false',
  description: 'The Earth is approximately spherical in shape'
});

// Style the header row
worksheet.getRow(1).font = { bold: true };
worksheet.getRow(1).fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFD3D3D3' }
};

// Add data validation for question_type
worksheet.getColumn('B').eachCell({ includeEmpty: false }, (cell, rowNumber) => {
  if (rowNumber > 1) {
    cell.dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"text_only,true_false"']
    };
  }
});

// Add data validation for answer column for true_false questions
worksheet.getColumn('G').eachCell({ includeEmpty: false }, (cell, rowNumber) => {
  if (rowNumber > 1) {
    cell.dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"a,b,c,d,true,false"']
    };
  }
});

// Create directory if it doesn't exist
const templatesDir = path.join(__dirname, 'public', 'assets', 'templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Write file
const filePath = path.join(templatesDir, 'questions_template.xlsx');
workbook.xlsx.writeFile(filePath)
  .then(() => {
    console.log(`Template file created at: ${filePath}`);
  })
  .catch(err => {
    console.error('Error creating template file:', err);
  }); 