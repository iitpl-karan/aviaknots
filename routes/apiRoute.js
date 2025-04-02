const express = require("express");
const api_route = express.Router();
const apiController = require("../controllers/apiController");
const path = require('path');
const passportJwt = require('../config/passport');
const passport = require("passport");
const jwt = require("jsonwebtoken");
const NodeCache = require("node-cache");
const authenticateUser = require('../middleware/authenticateUser')

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

// Signup
// api_route.post('/checkregistereduser', apiController.CheckRegisteredUser);
api_route.post('/usersignup', apiController.Signup);
api_route.post('/signupotp', apiController.GetUserOTP);
// api_route.post('/userverification', apiController.UserVerification);

// Signin
api_route.post('/usersignin', apiController.SignIn);
// api_route.post("/isVerifyAccount", apiController.isVerifyAccount);
// api_route.post("/resendOtp",apiController.resendOtp);

// Forgot Password
api_route.post('/userforgotpassword', apiController.ForgotPassword);
api_route.post('/forgotpasswordotp', apiController.GetForgotPasswordOTP);
// api_route.post('/userforgotpasswordverification', apiController.ForgotPasswordVerification);
api_route.post('/userresetpassword', apiController.ChangePassword);

// Edit User Profile
api_route.post('/getuser', authenticateUser, apiController.GetUser);
api_route.post('/usereditprofile', authenticateUser, upload.single('image'), apiController.EditUser);

// Upload Image
api_route.post('/uploadimage', authenticateUser, upload.single('image'), apiController.UploadImage);

// Delete Account
api_route.delete('/delete-account' , authenticateUser , apiController.deleteAccount)

// Intro
api_route.post('/getintro', apiController.GetIntro);

// Banner
api_route.post('/getallbanner', authenticateUser, apiController.GetBanner);

// Category
api_route.post('/getallcategories', authenticateUser, apiController.GetCategories);

// Exam
api_route.post('/getallexam', authenticateUser, apiController.GetExams);

// Subject
api_route.post('/get-subject', authenticateUser, apiController.GetExams);

// Quizzes
api_route.post('/getallquizzes', authenticateUser, apiController.GetQuizzes);
api_route.post('/getquizbycategory', authenticateUser, apiController.GetQuizByCategory);

// Questions
api_route.post('/getallquestions', authenticateUser, apiController.GetQuestions);
api_route.post('/getquestionsbyquizid', authenticateUser, apiController.GetQuestionsByQuizId);
api_route.post('/getquestionsbycategoryid', authenticateUser, apiController.GetQuestionsByCategoryId);

// Favourite Quiz
// api_route.post('/addfavouritequiz', passport.authenticate('jwt', { session: false }), apiController.AddFavouriteQuiz);
// api_route.post('/getfavouritequiz', passport.authenticate('jwt', { session: false }), apiController.GetFavouriteQuiz);
// api_route.post('/removefavouritequiz', passport.authenticate('jwt', { session: false }), apiController.RemoveFavouriteQuiz);

//Self Challange Quiz
// api_route.post('/selfchallangequiz', passport.authenticate('jwt', { session: false }), apiController.AddSelfChallangeQuiz);

// FeaturedCategory
api_route.post('/getfeaturedcategory', authenticateUser, apiController.GetFeaturedCategory);

// Ads Settings
// api_route.post('/getadssettings', passport.authenticate('jwt', { session: false }), apiController.GetAdsSettings);

// Points Setting
// api_route.post('/getpointssetting', passport.authenticate('jwt', { session: false }), apiController.GetPointsSetting);


// Points Setting
api_route.post('/paymentmethods', authenticateUser , apiController.GetPaymentOptions);

// Points Plan
api_route.post('/get_plan', authenticateUser, apiController.GetPlans);
api_route.post('/buy_plan', authenticateUser, apiController.BuyPlan);
api_route.post('/plan_history', authenticateUser, apiController.PlanHistory);

// User Quiz
api_route.post('/startquiz', authenticateUser, apiController.StartQuiz);
api_route.post('/quizhistory', authenticateUser, apiController.QuizHistory);
// api_route.post('/addPoints', authenticateUser, apiController.AddPoints);
// api_route.post('/getPoints', passport.authenticate('jwt', { session: false }), apiController.GetPoints);

//LeaderBoard 
// api_route.post('/leaderboard', passport.authenticate('jwt', { session: false }), apiController.LeaderBoard);
// api_route.post('/getuserrank', passport.authenticate('jwt', { session: false }), apiController.GetUserRank);

// Pages
api_route.post('/pages', apiController.getPages);

// Notification
api_route.post('/notifications', authenticateUser, apiController.GetNotifications);

module.exports = api_route;
