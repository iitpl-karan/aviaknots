const Notification = require("../models/notificationModel");
const common_Notification = require("../models/commonNotificationModel");
const Admin = require("../models/adminModel");
const admin = require('../config/firebase');
const Intro = require("../models/introModel");
require('dotenv').config();

const viewNotification = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        const allIntro = await common_Notification.find({}).sort({ createdAt: 1 });
        if (allIntro) {
            res.render('viewNotification', { intro: allIntro, loginData: loginData });
        }
        else {
            console.log(error.message);
        }

    } catch (error) {
        console.log(error.message);
    }
}

// Load notification
const loadNotification = async (req, res) => {
    try {
        res.render('addNotification');

    } catch (error) {
        console.log(error.message);
    }
}

// Add notification
const addNotification = async (req, res) => {
    try {
        let loginData = await Admin.findById({ _id: req.session.user_id });
        if (loginData.is_admin == 1) {
            const nottificationData = new common_Notification({
                title: req.body.title,
                description: req.body.description
            });
            const saveNotification = await nottificationData.save();

            const findAllToken = await Notification.find();
            const registrationTokensSet = new Set();
            findAllToken.forEach((user) => {
                if (user.registrationToken) {
                    registrationTokensSet.add(user.registrationToken);
                }
            });
            const registrationTokens = Array.from(registrationTokensSet);
            console.log('All unique registration tokens:', registrationTokens);

            if (!registrationTokens.length) {
                res.render('addNotification', { message: 'Notification Sent Successfully..!!' });
            } else {
                const serverKey = process.env.SERVER_KEY; 
                const deviceTokens = registrationTokens;
                const title = nottificationData.title;
                const body = nottificationData.description;

                sendPushNotification(registrationTokens, title, body);

                if (nottificationData) {
                    res.render('addNotification', { message: 'Notification Sent Successfully..!!' });
                }
            }
        }
        else {
            req.flash('error', 'You have no access to send notification , You are not super admin !! *');
            return res.redirect('back');
        }
    } catch (error) {
        console.log(error.message);
    }
}


function sendPushNotification(registrationTokens, title, body) {
    const message = {
        notification: {
            title: title,
            body: body
        },
        tokens: registrationTokens
    };

    admin.messaging().sendEachForMulticast(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.error('Error sending message:', error);
        });
}

module.exports = {
    loadNotification,
    addNotification,
    viewNotification,
}