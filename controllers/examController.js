const fs = require("fs");
const path = require('path')
const userimages = path.join('./public/assets/userImages/');
const Category = require("../models/categoryModel");
const Quiz = require("../models/quizModel");
const Admin = require("../models/adminModel");
const Exam = require("../models/examModel");



// Load category
const loadExam = async (req, res) => {
    try {
        res.render('addExam');
    } catch (error) {
        console.log(error.message);
    }
}



// Add category
const addexam = async (req, res) => {
    try {
        let loginData = await Admin.findById({_id:req.session.user_id});
        if (loginData.is_admin == 1) {
            const examData = new Exam({
                name: req.body.name,
                image: req.file.filename,
                is_feature: req.body.is_feature == "on" ? 1 : 0,
                is_active: req.body.is_active == "on" ? 1 : 0
            });
            const saveexam = await examData.save();
            if (saveexam) {
                res.render('addExam', { message: "Exam Added SuccessFully..!!" });
            }
            else {
                res.render('addExam', { message: "Exam Not Added..!!*" });
            }
        }
        else {
            req.flash('error', 'You have no access to add Exam , You are not super admin !! *');
            return res.redirect('back');
        }
    } catch (error) {
        console.log(error.message);
    }
}

// View category
const viewExam = async (req, res) => {
    try {
        let loginData = await Admin.find();
        const allCategory = await Exam.find({}).sort({ updatedAt: -1 });
        const quiz = await Quiz.find().populate('categoryId');
        if (allCategory) {
            res.render('viewExam', { category: allCategory, loginData: loginData, quiz: quiz });
        }
        else {
            console.log(error.message);
        }

    } catch (error) {
        console.log(error.message);
    }
}

// Edit category
const editExam = async (req, res) => {
    try {
        const id = req.query.id;
        const editData = await Exam.findById({ _id: id });
        if (editData) {
            res.render('editExam', { category: editData });
        }
        else {
            res.render('editExam', { message: 'Category Not Added' });
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Update category
const UpdateExam = async (req, res) => {
    try {
        let loginData = await Admin.findById({_id:req.session.user_id});
        if (loginData.is_admin == 1) {
            const id = req.body.id;
            const currentCategory = await Exam.findById(id);
            if (req.file) {
                if (currentCategory) {
                    if (fs.existsSync(userimages + currentCategory.image)) {
                        fs.unlinkSync(userimages + currentCategory.image)
                    }
                }
                const UpdateData = await Exam.findByIdAndUpdate({ _id: id },
                    {
                        $set: {
                            name: req.body.name,
                            image: req.file.filename
                        }
                    });
                res.redirect('/view-exam');
            }
            else {
                const UpdateData = await Exam.findByIdAndUpdate({ _id: id },
                    {
                        $set: {
                            name: req.body.name,
                            examId: req.body.examId,

                        }
                    });
                res.redirect('/view-exam');
            }
        }
        else {
            req.flash('error', 'You have no access to edit category , You are not super admin !! *');
            return res.redirect('back');
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Feature status
const featureStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = await Exam.findById(id);
        const is_feature = req.body.is_feature ? req.body.is_feature : "false";
        console.log(status);
        if (!status) {
            return res.sendStatus(404);
        }
        status.is_feature = !status.is_feature;
        console.log(status.is_feature);
        await status.save();
        res.redirect('/view-exam');

    } catch (err) {

        console.error(err);
        res.sendStatus(500);

    }
}

// Active status
const activeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = await Exam.findById(id);
        const is_active = req.body.is_active ? req.body.is_active : "false";
        console.log(status);
        if (!status) {
            return res.sendStatus(404);
        }
        status.is_active = !status.is_active;
        console.log(status.is_active);
        await status.save();
        res.redirect('/view-exam');
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}

// Delete category
const deleteExam = async (req, res) => {
    try {
        const id = req.query.id;
        const currentCategory = await Exam.findById(id);
        if (currentCategory) {
            if (fs.existsSync(userimages + currentCategory.image)) {
                fs.unlinkSync(userimages + currentCategory.image)
            }
        }
        const delBanner = await Exam.deleteOne({ _id: id });
        res.redirect('/view-exam');
    } catch (error) {
        console.log(error.message);
    }
}

// Featured category
const featuredCategory = async (req, res) => {
    try {
        let loginData = await Admin.findById({_id:req.session.user_id});
        const allCategory = await Category.find({ is_feature: 1 }).sort({ updatedAt: -1 });
        if (allCategory) {
            res.render('featuredCategory', { category: allCategory, loginData: loginData });
        }
        else {
            console.log(error.message);
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadExam,
    addexam,
    viewExam,
    editExam,
    UpdateExam,
    deleteExam,
    featureStatus,
    activeStatus,
    featuredCategory
}