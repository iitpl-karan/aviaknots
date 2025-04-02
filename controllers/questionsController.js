// const fs = require("fs");
// const path = require('path')
// const userimages = path.join('./public/assets/userImages/');
const Questions = require("../models/questionsModel");
const Admin = require("../models/adminModel");
const Category = require("../models/categoryModel");
const Quiz = require("../models/quizModel");
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Load questions
const loadQuestions = async (req, res) => {
    try {
        const categories = await Category.find({});
        const quizzes = await Quiz.find({});
        res.render('addQuestions',{category : categories, quiz : quizzes});

    } catch (error) {
        console.log(error.message);
    }
}

// Add questions
const addQuestions = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        if (Array.isArray(loginData)) { // Check if loginData is an array
            for (let i in loginData) {
                if (String(loginData[i]._id) === req.session.user_id) {
                    if (loginData[i].is_admin == 1) {
                        let optionData = {};
                        let optionType;

                        if (req.body.question_type == "text_only") {
                            optionType = "text_only";
                            optionData = {
                                a: req.body.a,
                                b: req.body.b,
                                c: req.body.c,
                                d: req.body.d,
                            };
                        } else if (req.body.question_type == "true_false") {
                            optionType = "true_false";
                            optionData = {
                                answer: req.body.answer,
                            };
                        } else if (req.body.question_type == "images") {
                            optionType = "images";
                            optionData = {
                                a: req.body.img_a,
                                b: req.body.img_b,
                                c: req.body.img_c,
                                d: req.body.img_d,
                            };
                        } else if (req.body.question_type == "audio") {
                            optionType = "audio";
                            optionData = {
                                a: req.body.audio_a,
                                b: req.body.audio_b,
                                c: req.body.audio_c,
                                d: req.body.audio_d,
                            };
                        }

                        const QuestionsData = new Questions({
                            categoryId: req.body.categoryId,
                            quizId: req.body.quizId,
                            question_title: req.body.question_title,
                            image: optionType === "images" ? req.files.image[0].filename : undefined,
                            audio: optionType === "audio" ? req.files.audio[0].filename : undefined,
                            question_type: optionType,
                            option: optionData,
                            answer: req.body.answer,
                            description: req.body.description,
                            is_active: req.body.is_active == "on" ? 1 : 0
                        });
                        
                        const saveQuestions = await QuestionsData.save();
                        const categories = await Category.find({});
                        const quizzes = await Quiz.find({});
                        if (saveQuestions) {
                            return res.render('addQuestions', { category: categories, quiz: quizzes, message: "Questions Added Successfully..!!" });
                        } else {
                            return res.render('addQuestions', { message: "Questions Not Added..!!*" });
                        }
                    } else {
                        req.flash('error', 'You have no access to add Questions, You are not super admin !! *');
                        return res.redirect('back');
                    }
                }
            }
        } else {
            req.flash('error', 'Login data is not an array');
            return res.redirect('back');
        }

    } catch (error) {
        console.log(error.message);
        req.flash('error', 'An error occurred while adding questions');
        return res.redirect('back');
    }
}

// View questions
const viewQuestions = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        const QuizData = await Quiz.find();
        const QuestionsData = await Questions.find().populate(['categoryId','quizId']).sort({updatedAt: -1});
        res.render('viewQuestions',{questions:QuestionsData,loginData: loginData,quiz:QuizData});

    } catch (error) {
        console.log(error.message);
    }
}

// Edit questions
const editQuestions = async (req, res) => {
    try {

        const id = req.query.id;
        const category = await Category.find();
        const quizzes = await Quiz.find({});
        const editData = await Questions.findById({ _id: id }).populate('categoryId');

        if (editData) {
            res.render('editQuestions', { editdata: editData,category:category,quiz:quizzes});
        }
        else {
            res.render('editQuestions', { message: 'Questions Not Added' });
        }

    } catch (error) {
        console.log(error.message);
    }
}

// Update questions
const UpdateQuestions = async(req,res)=> {
    try {
        let loginData = await Admin.findById({_id:req.session.user_id});
        if (loginData.is_admin == 1) {
            const id = req.body.id;
            let optionData = {};
            let optionType;
            if (req.body.question_type == "text_only") {
                optionType = "text_only";
                optionData = {
                    a: req.body.a,
                    b: req.body.b,
                    c: req.body.c,
                    d: req.body.d,
                };

            } else if (req.body.question_type == "true_false") {
                optionType = "true_false";
                optionData = {
                    answer: req.body.answer,
                };
            } else if (req.body.question_type == "images") {
                optionType ="images";
                optionData = {
                    a: req.body.img_a,
                    b: req.body.img_b,
                    c: req.body.img_c,
                    d: req.body.img_d,
                };
            }
            else if (req.body.question_type == "audio") {
                optionType = "audio";
                optionData = {
                    a: req.body.audio_a,
                    b: req.body.audio_b,
                    c: req.body.audio_c,
                    d: req.body.audio_d,
                };
            }
            if (req.files.image || req.files.audio) {
                const UpdateQuestions = await Questions.findByIdAndUpdate({ _id: id },
                    {
                        $set:
                        {
                            categoryId: req.body.categoryId,
                            quizId: req.body.quizId,
                            question_title: req.body.question_title,
                            image: optionType === "images" ? req.files.image[0].filename : undefined,
                            audio: optionType === "audio" ? req.files.audio[0].filename : undefined,
                            question_type : optionType,
                            option: optionData,
                            answer: req.body.answer,
                            description: req.body.description
                        }
                    });
                const saveQuestions = await UpdateQuestions.save();
                res.redirect('/view-questions');
            }
            else{
                const UpdateQuestions = await Questions.findByIdAndUpdate({ _id: id },
                    {
                        $set:
                        {
                            categoryId: req.body.categoryId,
                            quizId: req.body.quizId,
                            question_title: req.body.question_title,
                            question_type : optionType,
                            option: optionData,
                            answer: req.body.answer,
                            description: req.body.description
                        }
                    });
                const saveQuestions = await UpdateQuestions.save();
                res.redirect('/view-questions');
            }
        }
        else {
            req.flash('error', 'You have no access to edit quiz , You are not super admin !! *');
            return res.redirect('back');
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Delete questions
const deleteQuestions = async(req,res)=> {
    try {
        const id = req.query.id;
        const deleteQuestions = await Questions.deleteOne({_id:id});
        res.redirect('back');
        
    } catch (error) {
        console.log(error.message); 
    }
}

// Active status
const activeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = await Questions.findById(id);
        const is_active = req.body.is_active ? req.body.is_active : "false";
        console.log(status);
        if (!status) {
            return res.sendStatus(404);
        }
        status.is_active = !status.is_active;
        console.log(status.is_active);
        await status.save();
        res.redirect('/view-questions');

    } catch (err) {

        console.error(err);
        res.sendStatus(500);

    }
}

// Load Bulk Import Questions
const loadBulkImport = async (req, res) => {
    try {
        // Get all categories
        const categories = await Category.find({});
        
        // Get all quizzes
        const quizzes = await Quiz.find({}).lean();
        
        // Format the quizzes for the frontend
        const processedQuizzes = quizzes.map(quiz => ({
            _id: quiz._id.toString(),
            name: quiz.name,
            categoryId: quiz.categoryId ? quiz.categoryId.toString() : ''
        }));
        
        // Log for debugging
        console.log('Processed quizzes for bulk import:');
        processedQuizzes.forEach(q => {
            console.log(`Quiz: ${q.name}, CategoryId: ${q.categoryId}`);
        });
        
        res.render('bulkImportQuestions', { 
            category: categories, 
            quiz: processedQuizzes,
            flash: req.flash() || {}
        });
    } catch (error) {
        console.log(error.message);
        req.flash('error', 'An error occurred while loading bulk import page');
        return res.redirect('back');
    }
}

// Bulk Import Questions
const bulkImportQuestions = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        if (Array.isArray(loginData)) {
            for (let i in loginData) {
                if (String(loginData[i]._id) === req.session.user_id) {
                    if (loginData[i].is_admin == 1) {
                        // Check if file exists
                        if (!req.file) {
                            req.flash('error', 'Please upload an Excel file');
                            return res.redirect('back');
                        }

                        const { categoryId, quizId } = req.body;
                        
                        if (!categoryId || !quizId) {
                            req.flash('error', 'Category and Quiz are required');
                            return res.redirect('back');
                        }

                        const filePath = req.file.path;
                        const workbook = new ExcelJS.Workbook();
                        await workbook.xlsx.readFile(filePath);
                        
                        const worksheet = workbook.getWorksheet(1);
                        if (!worksheet) {
                            req.flash('error', 'Excel file has no worksheets');
                            return res.redirect('back');
                        }

                        const questions = [];
                        const errors = [];
                        let successCount = 0;
                        
                        // Start from row 2 (assuming row 1 is headers)
                        worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
                            if (rowNumber === 1) return; // Skip header row
                            
                            try {
                                const questionTitle = row.getCell(1).value;
                                const questionType = row.getCell(2).value;
                                
                                if (!questionTitle || !questionType) {
                                    errors.push(`Row ${rowNumber}: Question title and type are required`);
                                    return;
                                }
                                
                                const optionA = row.getCell(3).value;
                                const optionB = row.getCell(4).value;
                                const optionC = row.getCell(5).value;
                                const optionD = row.getCell(6).value;
                                const answer = row.getCell(7).value;
                                const description = row.getCell(8).value || '';
                                
                                if (!answer) {
                                    errors.push(`Row ${rowNumber}: Answer is required`);
                                    return;
                                }
                                
                                let optionData = {};
                                
                                // Validate based on question type
                                if (questionType === 'text_only') {
                                    if (!optionA || !optionB || !optionC || !optionD) {
                                        errors.push(`Row ${rowNumber}: All options are required for text_only questions`);
                                        return;
                                    }
                                    
                                    optionData = {
                                        a: optionA,
                                        b: optionB,
                                        c: optionC,
                                        d: optionD
                                    };
                                } else if (questionType === 'true_false') {
                                    if (answer !== 'true' && answer !== 'false') {
                                        errors.push(`Row ${rowNumber}: Answer must be 'true' or 'false' for true_false questions`);
                                        return;
                                    }
                                    optionData = {};
                                } else if (questionType === 'images' || questionType === 'audio') {
                                    errors.push(`Row ${rowNumber}: Image and audio question types are not supported in bulk import`);
                                    return;
                                } else {
                                    errors.push(`Row ${rowNumber}: Invalid question type '${questionType}'`);
                                    return;
                                }
                                
                                const questionData = {
                                    categoryId: categoryId,
                                    quizId: quizId,
                                    question_title: questionTitle,
                                    question_type: questionType,
                                    option: optionData,
                                    answer: answer,
                                    description: description,
                                    is_active: req.body.is_active === 'on' ? 1 : 0
                                };
                                
                                questions.push(questionData);
                            } catch (error) {
                                errors.push(`Row ${rowNumber}: ${error.message}`);
                            }
                        });
                        
                        // Create all the valid questions
                        if (questions.length > 0) {
                            try {
                                const result = await Questions.insertMany(questions);
                                successCount = result.length;
                            } catch (error) {
                                errors.push(`Database error: ${error.message}`);
                            }
                        }
                        
                        // Clean up the uploaded file
                        try {
                            fs.unlinkSync(filePath);
                        } catch (err) {
                            console.error('Error removing file:', err);
                        }
                        
                        // Prepare result message
                        let message = '';
                        if (successCount > 0) {
                            message += `Successfully imported ${successCount} questions. `;
                        }
                        
                        if (errors.length > 0) {
                            message += `Failed to import ${errors.length} questions. `;
                            req.flash('error', errors.join('\n'));
                        }
                        
                        if (successCount > 0) {
                            req.flash('success', message);
                            return res.redirect('/view-questions');
                        } else {
                            req.flash('error', 'No questions were imported');
                            return res.redirect('back');
                        }
                    } else {
                        req.flash('error', 'You have no access to bulk import questions, You are not super admin !! *');
                        return res.redirect('back');
                    }
                }
            }
        } else {
            req.flash('error', 'Login data is not an array');
            return res.redirect('back');
        }
    } catch (error) {
        console.log(error.message);
        req.flash('error', 'An error occurred while importing questions');
        return res.redirect('back');
    }
}

module.exports = {
    loadQuestions,
    addQuestions,
    viewQuestions,
    editQuestions,
    UpdateQuestions,
    deleteQuestions,
    activeStatus,
    loadBulkImport,
    bulkImportQuestions
}