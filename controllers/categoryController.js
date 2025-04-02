const fs = require("fs");
const path = require('path')
const userimages = path.join('./public/assets/userImages/');
const Category = require("../models/categoryModel");
const Quiz = require("../models/quizModel");
const Admin = require("../models/adminModel");
const Exam = require('../models/examModel')

// Load category
const loadCategory = async (req, res) => {
    try {
        // res.render('addCategory');

        const exam = await Exam.find();
        res.render('addCategory', { exam: exam });
    } catch (error) {
        console.log(error.message);
    }
}

// Add category
const addcategory = async (req, res) => {
    // console.log(req.body, "addcat");

    try {
        // Fetch logged-in admin data
        let loginData = await Admin.findById({ _id: req.session.user_id });

        if (loginData.is_admin == 1) {
            // Fetch all exams
            const exams = await Exam.find(); // Fetch exams from your database

            // Create a new category
            const categoryData = new Category({
                examId: req.body.examId,
                name: req.body.name,
                image: req.file?.filename || '', // Handle optional file
                is_feature: req.body.is_feature == "on" ? 1 : 0,
                is_active: req.body.is_active == "on" ? 1 : 0
            });

            const savecategory = await categoryData.save();

            if (savecategory) {
                // Pass `exams` to the template
                return res.render('addCategory', {
                    message: "Category Added Successfully..!!",
                    exam: exams
                });
            } else {
                return res.render('addCategory', {
                    message: "Category Not Added..!!",
                    exam: exams
                });
            }
        } else {
            req.flash(
                'error',
                'You have no access to add a category. You are not a super admin!'
            );
            return res.redirect('back');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

// View category
const viewCategory = async (req, res) => {
    try {
        let loginData = await Admin.find();
        const allCategory = await Category.find({}).populate('examId').sort({ updatedAt: -1 });
        const quiz = await Quiz.find().populate('categoryId');
        if (allCategory) {
            res.render('viewCategory', { category: allCategory, loginData: loginData, quiz: quiz });
        }
        else {
            console.log(error.message);
        }

    } catch (error) {
        console.log(error.message);
    }
}

// Edit category
const editCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const exam = await Exam.find();
        const editData = await Category.findById({ _id: id }).populate('examId')
        if (editData) {
            res.render('editCategory', { category: editData , exam : exam });
        }
        else {
            res.render('editCategory', { message: 'Category Not Added' });
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Update category
const UpdateCategory = async (req, res) => {
    

      console.log(req.body , "jnd")

    try {
        let loginData = await Admin.findById({_id:req.session.user_id});
        if (loginData.is_admin == 1) {
            const id = req.body.id;
            const currentCategory = await Category.findById(id);
            if (req.file) {
                if (currentCategory) {
                    if (fs.existsSync(userimages + currentCategory.image)) {
                        fs.unlinkSync(userimages + currentCategory.image)
                    }
                }
                const UpdateData = await Category.findByIdAndUpdate({ _id: id },
                    {
                        $set: {
                            name: req.body.name,
                            image: req.file.filename,
                            examId: req.body.examId
                        }
                    });
                res.redirect('/view-category');
            }
            else {
                const UpdateData = await Category.findByIdAndUpdate({ _id: id },
                    {
                        $set: {
                            name: req.body.name,
                            examId: req.body.examId

                        }
                    });
                res.redirect('/view-category');
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
        const status = await Category.findById(id);
        const is_feature = req.body.is_feature ? req.body.is_feature : "false";
        console.log(status);
        if (!status) {
            return res.sendStatus(404);
        }
        status.is_feature = !status.is_feature;
        console.log(status.is_feature);
        await status.save();
        res.redirect('/view-category');

    } catch (err) {

        console.error(err);
        res.sendStatus(500);

    }
}

// Active status
const activeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = await Category.findById(id);
        const is_active = req.body.is_active ? req.body.is_active : "false";
        console.log(status);
        if (!status) {
            return res.sendStatus(404);
        }
        status.is_active = !status.is_active;
        console.log(status.is_active);
        await status.save();
        res.redirect('/view-category');
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}

// Delete category
const deleteCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const currentCategory = await Category.findById(id);
        if (currentCategory) {
            if (fs.existsSync(userimages + currentCategory.image)) {
                fs.unlinkSync(userimages + currentCategory.image)
            }
        }
        const delBanner = await Category.deleteOne({ _id: id });
        res.redirect('/view-category');
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
    loadCategory,
    addcategory,
    viewCategory,
    editCategory,
    UpdateCategory,
    deleteCategory,
    featureStatus,
    activeStatus,
    featuredCategory
}