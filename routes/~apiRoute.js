const express = require("express");
const api_route = express.Router();
const apiController = require("../controllers/~apiController");
const path = require('path');
const passportJwt = require('../config/passport');
const passport = require("passport");
const jwt = require("jsonwebtoken");
const NodeCache = require( "node-cache" );
// const nodeCache = new NodeCache();

/**---- Upload Images-----**/
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

api_route.post('/checkRegisteredUser', apiController.checkRegisteredUser);
api_route.post('/userSignup', apiController.signup);
api_route.post('/userVerification', apiController.verify);
api_route.post('/userSignin', apiController.signin);
api_route.post('/userForgotPassword', apiController.forgotPassword);
api_route.post('/userForgotPasswordVerification', apiController.forgotPasswordVerification);
api_route.post('/userResetPassword', apiController.changePassword);
api_route.post('/getUserById',passport.authenticate('jwt', { session: false }),apiController.getUserById);
api_route.post('/userEditProfile', passport.authenticate('jwt', { session: false }),upload.single('image'), apiController.EditUser);
api_route.post('/uploadImage', passport.authenticate('jwt', { session: false }),upload.single('image'), apiController.uploadImage);
// api_route.post('/contactUs', passport.authenticate('jwt', { session: false }), apiController.contactUs);
api_route.post('/withdraw', passport.authenticate('jwt', { session: false }), apiController.addWithdrawal);
api_route.post('/getAllQuestions',passport.authenticate('jwt', { session: false }),apiController.getAllQuestions);
api_route.post('/getAllCategory', passport.authenticate('jwt', { session: false }), apiController.getAllCategory);
api_route.post('/editCategory', passport.authenticate('jwt', { session: false }), apiController.editCategory);
api_route.post('/questionByCategory',passport.authenticate('jwt', { session: false }),apiController.getQuestionByCategory);
api_route.post('/setting',passport.authenticate('jwt', { session: false }),apiController.quizSetting);
api_route.post('/addQuiz',passport.authenticate('jwt', { session: false }),apiController.addQuiz);
api_route.post('/quizHistory',passport.authenticate('jwt', { session: false }),apiController.quizHistory);
api_route.post('/addPoints',passport.authenticate('jwt', { session: false }),apiController.addPoints);

module.exports = api_route;
