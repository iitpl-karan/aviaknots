const Users = require("../models/userModel");
const Category = require("../models/categoryModel")
const Pages = require('../models/pagesModel')
const sha256 = require("sha256");
const Quiz = require("../models/quizModel");
const Questions = require("../models/questionsModel");
const Plan = require('../models/planModel');
const Notification = require("../models/notificationModel");
const common_Notification = require("../models/commonNotificationModel");
const Banner = require("../models/bannerModel");



const jwt = require('jsonwebtoken');


exports.Signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log(req.body, "password")

        // Input validation
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        // Check if the user already exists
        const userAlreadyExist = await Users.findOne({ email });
        if (userAlreadyExist) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        // Generate a salt and hash the password
        const salt = process.env.PASSWORD_SALT || "default_salt"; // Use a strong, unique salt in production
        const hashedPassword = sha256(password + salt);

        // Create a new user
        const user = new Users({
            username,
            email,
            password: hashedPassword,
        });

        // Save the user to the database
        const savedUser = await user.save();
        if (savedUser) {
            return res.status(201).json({
                message: "User created successfully",
                userId: savedUser._id, // Optionally return the user ID
            });
        } else {
            return res.status(500).json({
                message: "Unable to add the user to the database",
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "An unexpected server error occurred",
        });
    }
};


exports.SignIn = async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        console.log(req.body, "userType")

        // Input validation
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        // Find the user by email
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        // Check if the user account is blocked
        if (user.status === 0) {
            return res.status(403).json({ message: "Your account has been blocked by the admin." });
        }

        // Hash the provided password with the same salt used during signup
        const salt = process.env.PASSWORD_SALT || "default_salt"; // Replace with a secure salt
        const hashedInputPassword = sha256(password + salt);

        // Compare the hashed passwords
        if (hashedInputPassword !== user.password) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        // Validate the user type (optional)
        // if (userType && user.userType !== userType) {
        //     return res.status(403).json({ message: "User type mismatch" });
        // }

        // Create a JWT payload
        const payload = {
            user: {
                id: user.id,
                email: user.email,
            },
        };

        // Sign the JWT with a secret key and expiration time
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            (err, token) => {
                if (err) throw err;
                res.status(200).json({
                    token,
                    message: "Login successful",
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        // userType: user.userType,
                    },
                });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error occurred" });
    }
};


exports.GetUser = async (req, res) => {

    let userid = req.user.user.id
    console.log(userid, "GetUser")
    try {
        let userinfo = await Users.findById(userid).select('-password'); // Excludes the password field
        userinfo.filte
        if (userinfo) {
            res.status(200).json({
                userinfo,
                message: 'User Details'
            })
        } else {
            res.status(400).json({
                message: 'User Not Found'
            })
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error occurred" });
    }


}


exports.EditUser = async (req, res) => {

    let userid = req.user.user.id
    console.log(userid, "GetUser")
    try {
        let userinfo = await Users.findById(userid).select('-password'); // Excludes the password field
        userinfo.filte
        if (userinfo) {
            res.status(200).json({
                userinfo,
                message: 'User Details'
            })
        } else {
            res.status(400).json({
                message: 'User Not Found'
            })
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error occurred" });
    }


}




exports.GetCategories = async (req, res) => {

    try {
        const allCategory = await Category.find();
        if (allCategory) {
            res.status(200).json({ allCategory, message: "Server error occurred" });

        } else {
            res.status(400).json({
                message: "Server error occurred"
            })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error occurred" });
    }
}


exports.GetFeaturedCategory = async (req, res) => {


    try {
        const allCategory = await Category.find({ is_feature: true });
        if (allCategory) {
            res.status(200).json({ allCategory, message: "Server error occurred" });

        } else {
            res.status(400).json({
                message: "Server error occurred"
            })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error occurred" });
    }

}





exports.GetQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find(); // Assuming Quiz is your model
        if (quizzes && quizzes.length > 0) {
            res.status(200).json({
                quizzes,
                message: "All Quizzes retrieved successfully",
            });
        } else {
            res.status(404).json({
                message: "Quizzes not found",
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error occurred",
        });
    }
};



exports.GetQuizByCategory = async (req, res) => {

    let catogery = req.body.catogery;
    // let catogery = '667970d49eab5af69a748917';
    //    console.log(catogery  , "catogery")

    try {
        const quizzes = await Quiz.find({ categoryId: catogery }); // Assuming Quiz is your model
        if (quizzes && quizzes.length > 0) {
            res.status(200).json({
                quizzes,
                message: "All Quizzes retrieved successfully",
            });
        } else {
            res.status(404).json({
                message: "Quizzes not found",
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error occurred",
        });
    }
};



exports.GetQuestions = async (req, res) => {
    try {
        const questions = await Questions.find(); // Assuming Questions is your model
        if (questions && questions.length > 0) {
            res.status(200).json({
                questions, // Sending the retrieved questions
                message: "All Questions retrieved successfully",
            });
        } else {
            res.status(404).json({
                message: "Questions not found",
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error occurred",
        });
    }
};


exports.GetQuestionsByQuizId = async (req, res) => {

    let quizid = req.body.quizid;


    try {
        const questions = await Questions.find({ quizId: quizid }); // Assuming Questions is your model
        if (questions && questions.length > 0) {
            res.status(200).json({
                questions, // Sending the retrieved questions
                message: "All Questions retrieved successfully",
            });
        } else {
            res.status(404).json({
                message: "Questions not found",
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error occurred",
        });
    }
};



exports.GetQuestionsByCategoryId = async (req, res) => {

    let catogery_id = req.body.catogery_id;

    try {
        const questions = await Questions.find({ categoryId: catogery_id });
        if (questions && questions.length > 0) {
            res.status(200).json({
                questions,
                message: "All Questions retrieved successfully",
            });
        } else {
            res.status(404).json({
                message: "Questions not found",
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error occurred",
        });
    }
};


exports.GetPlans = async (req, res) => {


    try {
        const plan = await Plan.find();
        if (plan && plan.length > 0) {
            res.status(200).json({
                plan,
                message: "All Plan retrieved successfully",
            });
        } else {
            res.status(404).json({
                message: "Plan not found",
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error occurred",
        });
    }
};


exports.GetNotifications = async (req, res) => {


    try {
        const notification = await common_Notification.find();
        if (notification && notification.length > 0) {
            res.status(200).json({
                notification,
                message: "All Notification retrieved successfully",
            });
        } else {
            res.status(404).json({
                message: "Notification not found",
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error occurred",
        });
    }
};





exports.getPages = async (req, res) => {

    try {
        const pages = await Pages.find()
        if (pages) {
            res.status(200).json({ pages, message: 'Page Data' })
        } else {
            res.status(400).json({
                message: 'Page Not found'
            })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error occurred" });
    }
}



exports.GetBanner = async (req, res) => {

    try {
        const banner = await Banner.find()
        if (banner) {
            res.status(200).json({ banner, message: 'Banner Data' })
        } else {
            res.status(400).json({
                message: 'Page Not found'
            })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error occurred" });
    }
}


