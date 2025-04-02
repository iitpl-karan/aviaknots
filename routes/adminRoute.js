// Load Environment Variables
require('dotenv').config();

// Express for routing
const express = require("express");
const admin_route = express();

// Body Parser for form data
const bodyParser = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

// EJS and Static Files
const path = require('path');
admin_route.set('view engine', 'ejs');
admin_route.set('views', [path.join('./', '/views/admin/'), path.join('./', '/views/layout/')]);
admin_route.use(express.static('public'));

// Multer for file uploads
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/assets/userImages'));
    },
    filename: function (req, file, cb) {
      const name = Date.now() + '-' + file.originalname;
      cb(null, name);
    }
  });

const upload = multer({ storage: storage });
const auth = require("../middleware/auth");

// Controllers
const adminController = require("../controllers/adminController");
const BannerController = require("../controllers/bannerController");
const IntroController = require("../controllers/introController");
const CurrencyController = require("../controllers/currencyController");
const CategoryController = require("../controllers/categoryController");
const ExamController = require("../controllers/examController");

const QuizController = require("../controllers/quizController");
const QuestionsController = require("../controllers/questionsController");
const PlanController = require("../controllers/planController");
const PaymentMethodController = require("../controllers/paymentMethodController");
const AdsController = require("../controllers/adsController");
const SettingController = require("../controllers/settingController");
const notificationController = require("../controllers/notificationController");

// Login
admin_route.get('/',auth.isLogout,adminController.loginLoad);
admin_route.get('/login',auth.isLogout,adminController.loginLoad);
admin_route.post('/login',adminController.login);

// Dashboard, Profile 
admin_route.get('/dashboard',auth.isLogin,adminController.dashboardLoad);
admin_route.get('/edit-profile', auth.isLogin, adminController.adminProfile);
admin_route.post('/edit-profile', upload.single('image'), adminController.editProfile);
admin_route.get('/change-password', auth.isLogin, adminController.changePassword);
admin_route.post('/change-password', auth.isLogin, adminController.resetAdminPassword);
admin_route.get('/currency',auth.isLogin, CurrencyController.currency);
admin_route.post('/currency', CurrencyController.currencydata);
// admin_route.get('/view-users',auth.isLogin,adminController.viewUsers);
admin_route.post('/view-users/:id/toggle',adminController.userStatus);
admin_route.get('/logout', auth.isLogin, adminController.adminLogout);

// Intro
admin_route.get('/add-intro',auth.isLogin,IntroController.loadIntro);
admin_route.post('/add-intro',upload.single('image'),IntroController.addIntro);
admin_route.get('/view-intro',auth.isLogin,IntroController.viewIntro);
admin_route.post('/intro-is-active/:id/toggle', IntroController.activeStatus);
admin_route.get('/edit-intro',auth.isLogin,IntroController.editIntro);
admin_route.post('/edit-intro',upload.single('image'),IntroController.UpdateIntro);
admin_route.get('/delete-intro',auth.isLogin,IntroController.deleteIntro);

// Banner
admin_route.get('/add-banner',auth.isLogin,BannerController.loadBanner);
admin_route.post('/add-banner',upload.single('image'),BannerController.addBanner);
admin_route.get('/view-banner',auth.isLogin,BannerController.viewBanner);
admin_route.post('/banner-is-active/:id/toggle', BannerController.activeStatus);
admin_route.get('/edit-banner',auth.isLogin,BannerController.editBanner);
admin_route.post('/edit-banner',upload.single('image'),BannerController.UpdateBanner);
admin_route.get('/delete-banner',auth.isLogin,BannerController.deleteBanner);

// Category
admin_route.get('/add-category',auth.isLogin,CategoryController.loadCategory);
admin_route.post('/add-category',upload.single('image'),CategoryController.addcategory);
admin_route.get('/view-category',auth.isLogin,CategoryController.viewCategory);
admin_route.get('/edit-category',auth.isLogin,CategoryController.editCategory);
admin_route.post('/edit-category',upload.single('image'),CategoryController.UpdateCategory);
admin_route.post('/update-is-feature/:id/toggle',CategoryController.featureStatus);
admin_route.post('/category-is-active/:id/toggle',CategoryController.activeStatus);
admin_route.get('/delete-category',auth.isLogin,CategoryController.deleteCategory);


//Exam


admin_route.get('/add-exam',auth.isLogin,ExamController.loadExam);
admin_route.post('/add-exam',upload.single('image'),ExamController.addexam);
admin_route.get('/view-exam',auth.isLogin,ExamController.viewExam);
admin_route.get('/edit-exam',auth.isLogin,ExamController.editExam);
admin_route.post('/edit-exam',upload.single('image'),ExamController.UpdateExam);
admin_route.post('/update-is-feature/:id/toggle',ExamController.featureStatus);
admin_route.post('/category-is-active/:id/toggle',ExamController.activeStatus);
admin_route.get('/delete-exam',auth.isLogin,ExamController.deleteExam);


// Feature Category
admin_route.get('/view-featured-category',auth.isLogin,CategoryController.featuredCategory);

// Quiz
admin_route.get('/add-quiz',auth.isLogin,QuizController.loadQuiz);
admin_route.post('/add-quiz',upload.single('image'),QuizController.addQuiz);
admin_route.get('/view-quiz',auth.isLogin,QuizController.viewQuiz);
admin_route.post('/quiz-is-active/:id/toggle',QuizController.activeStatus);
admin_route.get('/edit-quiz',auth.isLogin,QuizController.editQuiz);
admin_route.post('/edit-quiz',upload.single('image'),QuizController.UpdateQuiz);
admin_route.get('/delete-quiz',auth.isLogin,QuizController.deleteQuiz);

// Image and Audio Upload
var cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, {name: 'audio',maxCount: 1}]);

// Questions
admin_route.get('/add-questions',auth.isLogin,QuestionsController.loadQuestions);
admin_route.post('/add-questions',cpUpload,QuestionsController.addQuestions);
admin_route.get('/view-questions',auth.isLogin,QuestionsController.viewQuestions);
admin_route.get('/bulk-import-questions',auth.isLogin,QuestionsController.loadBulkImport);
admin_route.post('/bulk-import-questions',upload.single('excel_file'),QuestionsController.bulkImportQuestions);
admin_route.post('/questions-is-active/:id/toggle',QuestionsController.activeStatus);
admin_route.get('/edit-questions',auth.isLogin,QuestionsController.editQuestions);
admin_route.post('/edit-questions',cpUpload,QuestionsController.UpdateQuestions);
admin_route.get('/delete-questions',auth.isLogin,QuestionsController.deleteQuestions);

// Plan
admin_route.get('/add-plan',auth.isLogin,PlanController.loadPlan);
admin_route.post('/add-plan',PlanController.addPlan);
admin_route.get('/view-plan',auth.isLogin,PlanController.viewPlan);
admin_route.get('/edit-plan',auth.isLogin,PlanController.editPlan);
admin_route.post('/edit-plan',auth.isLogin,PlanController.updatePlan);
admin_route.get('/delete-plan',auth.isLogin,PlanController.deletePlan);

// Payment Method
admin_route.get('/add-payment-method',auth.isLogin,PaymentMethodController.loadPayment);
admin_route.post('/add-payment-method',upload.single('image'),PaymentMethodController.addPaymentMethod);
admin_route.get('/view-payment-method',auth.isLogin,PaymentMethodController.viewPaymentMethod);
admin_route.get('/edit-payment-method',auth.isLogin,PaymentMethodController.editPaymentMethod);
admin_route.post('/edit-payment-method',upload.single('image'),PaymentMethodController.updatePaymentMethod);
admin_route.post('/update-is-enable/:id/toggle',PaymentMethodController.is_enableStatus);
admin_route.get('/delete-payment-method',auth.isLogin,PaymentMethodController.deletePaymentMethod);

// Ads Settings
admin_route.get('/ads-settings',auth.isLogin,AdsController.loadAds);
admin_route.post('/ads-settings',auth.isLogin,AdsController.addAdsSetting);

//user routes
admin_route.get('/view-users',auth.isLogin,adminController.viewUsers);
admin_route.get('/add-user',auth.isLogin,adminController.loadaddUser);
admin_route.post('/add-user',upload.single('image'),adminController.adduser);
admin_route.get('/edit-user',auth.isLogin,adminController.edituser);
admin_route.get('/show-userdetails',auth.isLogin,adminController.edituser);



// admin_route.post('/edit-user',upload.single('image'),adminController.updateuser);



// admin_route.get('/edit-user',auth.isLogin,adminController.Quiz);



// Settings
admin_route.get('/setting',auth.isLogin,SettingController.loadSetting);
admin_route.post('/setting',auth.isLogin,SettingController.addSetting);

// Notificationsz
admin_route.get('/view-notification',auth.isLogin,notificationController.viewNotification);
admin_route.get('/add-notification',auth.isLogin,notificationController.loadNotification);
admin_route.post('/add-notification', notificationController.addNotification);

// Page Route
const PageController = require("../controllers/pageController");
admin_route.get('/pages',auth.isLogin, PageController.pageLoad);
admin_route.post('/pages',auth.isLogin, PageController.addPages);

admin_route.get('*', auth.isLogin, function (req, res) {
  res.redirect('/');
});

module.exports = admin_route;