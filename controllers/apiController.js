const Users = require("../models/userModel");
const jwt = require('jsonwebtoken');
const Intro = require("../models/introModel");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const UserPlan = require('../models/userPlanModel')
const Category = require("../models/categoryModel")
const Pages = require('../models/pagesModel')
const sha256 = require("sha256");
const Quiz = require("../models/quizModel");
const Questions = require("../models/questionsModel");
const Plan = require('../models/planModel');
const Notification = require("../models/notificationModel");
const common_Notification = require("../models/commonNotificationModel");
const Banner = require("../models/bannerModel");
const UserQuiz = require('../models/userQuizModel');
const Setting = require('../models/settingModel');
const settingModel = require("../models/settingModel");
const Exam = require("../models/examModel");
const Payment = require("../models/payment");
const PaymentMethod = require("../models/paymentMethodModel");

exports.Signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log(req.body, "password")

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const userAlreadyExist = await Users.findOne({ email });
        if (userAlreadyExist) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const salt = process.env.PASSWORD_SALT || "default_salt";
        const hashedPassword = sha256(password + salt);

        const user = new Users({
            username,
            email,
            password: hashedPassword,
        });

        const savedUser = await user.save();
        if (savedUser) {
            return res.status(201).json({
                message: "User created successfully",
                userId: savedUser._id,
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

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        if (user.status === false) {
            return res.status(403).json({ message: "Your account has been blocked by the admin." });
        }

        const salt = process.env.PASSWORD_SALT || "default_salt";
        const hashedInputPassword = sha256(password + salt);

        if (hashedInputPassword !== user.password) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        const payload = {
            user: {
                id: user.id,
                email: user.email,
            },
        };

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
                        userType,
                    },
                });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error occurred" });
    }
};

exports.GetUserOTP = async (req, res) => {
    try {
        let phone = req.body
        console.log(phone, "phone")

        if (phone) {
            res.status(200).json({
                message: "OTP sent successfully",
                otp: "123456",
            })
        }
    } catch (error) {
        console.error(err);
        res.status(500).json({ message: "Server error occurred" });
    }
}

exports.ForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const otp = crypto.randomInt(100000, 999999);
        const otpExpiry = Date.now() + 10 * 60 * 1000;
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save({ validateModifiedOnly: true });
        const transporter = nodemailer.createTransport({
            host: process.env.SMTPHOST,
            auth: {
                user: process.env.SMTPEMAIL,
                pass: process.env.SMTPASSWORD,
            },
        });

        const mailOptions = {
            from: 'gauravkumarjha335@gmail.com',
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is ${otp}. It will expire in 10 minutes.`,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Your OTp is ", `${otp}`);

        res.status(200).json({ message: 'Password reset OTP sent to your email' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.GetForgotPasswordOTP = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp.toString() !== otp.toString()) {
            return res.status(400).json({ message: 'OTP Invalid' });
        }

        if (user.otp.toString() == otp.toString()) {
            return res.status(200).json({ message: 'OTP verified successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.ChangePassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    console.log(req.body);

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    if (!newPassword) {
        return res.status(400).json({ message: 'newPassword is required' });
    }

    try {
        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(otp, "otp");
        console.log(user.otp, "user.otp");
        console.log(user, "userdata")

        if (user?.otp?.toString() !== otp?.toString()) {
            return res.status(400).json({ message: 'OTP Invalid' });
        }

        const salt = process.env.PASSWORD_SALT || "default_salt";
        const hashedPassword = sha256(newPassword + salt);

        console.log(newPassword, "Password");
        console.log(hashedPassword, "hashedPassword");

        user.password = hashedPassword;
        user.otp = undefined;
        await user.save();

        res.status(200).json({ message: 'NewPassword updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.GetUser = async (req, res) => {
    let userid = req.user.user.id
    console.log(userid, "GetUser")
    try {
        let userinfo = await Users.findById(userid).select('-password');
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
    try {
        const { id } = req.user.user;
        const { email, phone, username } = req.body
        const image = req.file ? req.file.image : undefined;

        console.log(req.body)

        let user = await Users.findById(id).select('-password')

        if (user) {
            user.email = email
            user.phone = phone
            user.username = username

            if (image) {
                user.image = image
            }

            await user.save();

            res.status(200).json({
                message: 'User Updated',
                user
            })
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.UploadImage = async (req, res) => {
    try {
        let userId = req.user.user.id
        console.log(req.file, "file")

        const user = await Users.findById(userId);
        if (user) {
            user.image = req.file.filename;
            await user.save();
            res.status(200).json({
                message: "Image uploaded successfully",
            })
        } else {
            res.status(500).json({ message: "Unable to Update" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error occurred" });
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        let userid = req.user.user.id
        console.log(userid, "userid")

        let deleteuser = await Users.findById(userid)

        if (deleteuser) {
            await deleteuser.remove()
            res.status(200).json({ message: "Account deleted successfully" })
        } else {
            res.status(500).json({ message: "Unable to delete account" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error occurred" })
    }
}

exports.GetPaymentOptions = async (req, res) => {
    try {
        const Paymentmethod = await PaymentMethod.find();
        if (Paymentmethod && Paymentmethod.length > 0) {
            res.status(200).json({
                Paymentmethod,
                message: "All PaymentMethod retrieved successfully",
            });
        } else {
            res.status(404).json({
                message: "PaymentMethod not found",
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




exports.BuyPlan = async (req, res) => {
    try {
        let userId = req.user.user.id;
        let planId = req.body.plan_id;

        let { plan_id, order_id, payment_id, amount_paid, status, method, captured } = req.body

        if (!planId) {
            return res.status(400).json({ message: "Plan ID is required" });
        }

        let user = await Users.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User Not Found" });
        }

        let plan = await Plan.findById(planId);

        if (!plan) {
            return res.status(400).json({ message: "Plan Not Found" });
        }

        if (!order_id || !payment_id || !amount_paid || !status || !method) {
            return res.status(400).json({ message: "Missing payment Data" });
        }

        if (status !== 'captured') {
            return res.status(400).json({ message: "Payment Fail Please try again" });
        }

        if (captured == false) {
            return res.status(400).json({ message: "Payment Fail Please try again" });
        }

        let { price, points } = plan;

        let savePlan = new UserPlan({
            userId,
            planId,
            price,
            points
        });

        let savePayment = new Payment({
            user_id: userId,
            plan_id,
            order_id,
            payment_id,
            amount_paid,
            status,
            method,
            captured
        });

        user.points = (user.points || 0) + points;

        await user.save();
        await savePlan.save();
        await savePayment.save();

        return res.status(200).json({
            message: "Plan bought successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error occurred" });
    }
};

exports.PlanHistory = async (req, res) => {
    try {
        const user_id = req?.user?.user?.id;

        if (!user_id) {
            return res.status(404).json({
                message: "User not found or unauthorized",
            });
        }

        const allPlans = await UserPlan.find({ userId: user_id });

        if (allPlans && allPlans.length > 0) {
            return res.status(200).json({
                message: "Plan history found",
                plans: allPlans,
            });
        } else {
            return res.status(404).json({
                message: "No plan history found for the user",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error occurred" });
    }
};

// Additional methods for this controller can be added here

exports.StartQuiz = async (req, res) => {
    try {
        const { quizId, questionDetails } = req.body;

        if (!quizId || !Array.isArray(questionDetails) || questionDetails.length === 0) {
            return res.status(400).json({ error: 'Quiz ID and question details are required.' });
        }

        const userId = req.user.user.id;

        const quizExists = await Quiz.findById(quizId);
        if (!quizExists) {
            return res.status(404).json({ error: 'Quiz not found.' });
        }

        const totalQuestions = await Questions.countDocuments({ quizId });
        const attemptQuestions = questionDetails.length;

        const Calculateanswer = async () => {
            const setting = await settingModel.findOne();
            if (!setting) {
                throw new Error('Settings not found.');
            }

            const pointForCorrect = setting.correct_ans_reward_per_question;
            const pointForIncorrect = setting.penalty_per_question;

            let correct = 0;
            let wrong = 0;

            questionDetails.forEach((question) => {
                const userAnswer = question.user_answer;
                const correctAnswer = question.answer;

                if (userAnswer === correctAnswer) {
                    correct++;
                } else {
                    wrong++;
                }
            });

            const score = pointForCorrect * correct - pointForIncorrect * wrong;

            return { correct, wrong, score };
        };

        const CalculatedData = await Calculateanswer();

        const average = (
            ((CalculatedData.correct / totalQuestions) * 100).toFixed(2)
        );

        let userpoint = await Users.findById(userId);

        if (userpoint) {
            userpoint.points = (userpoint.points || 0) + CalculatedData.score;
            await userpoint.save();
            console.log("User points updated successfully:",);
        } else {
            res.status(500).json({ error: 'User Not Found' });
        }

        const userQuiz = new UserQuiz({
            userId,
            quizId,
            questionDetails,
            total_questions: totalQuestions,
            attempt_questions: attemptQuestions,
            correct_answers: CalculatedData.correct,
            wrong_answers: CalculatedData.wrong,
            score: CalculatedData.score,
            total_avg: average
        });

        return res.status(201).json({
            message: 'Quiz started successfully.',
            userQuiz
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while starting the quiz.' });
    }
};

exports.QuizHistory = async (req, res) => {
    try {
        let userid = req.user.user.id
        let PreviousQuiz = await UserQuiz.find({ userId: userid })
        if (PreviousQuiz) {
            return res.status(200).json({
                message: 'Quiz history found',
                quizhistory: PreviousQuiz
            })
        } else {
            return res.status(404).json({ error: 'Quiz history not found' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error occurred" });
    }
}

exports.GetIntro = async (req, res) => {
    try {
        let intro = await Intro.find()
        if (intro) {
            res.status(200).json({
                message: "Intro fetched successfully",
                intro,
            })
        } else {
            res.status(500).json({ message: "Intro not found" });
        }
    } catch (error) {
        console.log(error)
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

exports.GetCategories = async (req, res) => {
    const { exam_id: examId } = req.body;

    try {
        if (examId) {
            const allCategory = await Category.find({ examId: examId, is_active: 1 });
            if (allCategory && allCategory.length > 0) {
                return res.status(200).json({
                    allCategory,
                    message: "Categories fetched successfully",
                });
            } else {
                return res.status(404).json({
                    message: "No categories found",
                });
            }
        } else {
            const allCategory = await Category.find({ is_active: 1 });
            if (allCategory && allCategory.length > 0) {
                return res.status(200).json({
                    allCategory,
                    message: "Categories fetched successfully",
                });
            } else {
                return res.status(404).json({
                    message: "No categories found",
                });
            }
        }
    } catch (err) {
        console.error("Error fetching categories:", err.message);
        return res.status(500).json({
            message: "Server error occurred while fetching categories",
        });
    }
};

exports.GetExams = async (req, res) => {
    try {
        const allExam = await Exam.find();
        if (allExam) {
            res.status(200).json({ allExam, message: "All Exam" });
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

exports.GetSubjectByExam = async (req, res) => {
    try {
        const allExam = await Exam.find();
        if (allExam) {
            res.status(200).json({ allExam, message: "All Exam" });
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
        const quizzes = await Quiz.find();
        const questionData = await Questions.find().populate('quizId');

        const questionCountMap = {};

        questionData.forEach((question) => {
            const quizId = question.quizId._id.toString();
            if (questionCountMap[quizId]) {
                questionCountMap[quizId]++;
            } else {
                questionCountMap[quizId] = 1;
            }
        });

        const quizzesWithCounts = quizzes.map((quiz) => {
            const questionCount = questionCountMap[quiz._id.toString()] || 0;
            const minutesPerQuestion = quiz.minutes_per_quiz || 1;
            const totalTime = questionCount * minutesPerQuestion;
            return {
                ...quiz.toObject(),
                questionCount,
                totalTime,
            };
        });

        if (quizzesWithCounts.length > 0) {
            res.status(200).json({
                quizzes: quizzesWithCounts,
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

    try {
        const quizzes = await Quiz.find({ categoryId: catogery });
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
        const userId = req.user.user.id;

        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const userPoints = user.points || 0;

        if (userPoints > 0) {
            const questions = await Questions.find();

            if (questions && questions.length > 0) {
                res.status(200).json({
                    userPoints,
                    questions,
                    message: "All Questions retrieved successfully",
                });
            } else {
                res.status(404).json({
                    message: "Questions not found",
                });
            }
        } else {
            res.status(403).json({
                message: "You don't have enough points to access this page",
            });
        }
    } catch (err) {
        console.error("Error in GetQuestions:", err);
        res.status(500).json({
            message: "Server error occurred",
        });
    }
};

exports.GetQuestionsByQuizId = async (req, res) => {
    try {
        let quizid = req.body.quizid;

        const userId = req.user.user.id;

        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const userPoints = user.points || 0;

        if (userPoints > 0) {
            const questions = await Questions.find({ quizId: quizid });
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
        } else {
            res.status(403).json({
                message: "You don't have enough points to access this page",
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
    try {
        const userId = req.user.user.id;
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const userPoints = user.points || 0;
        let catogery_id = req.body.catogery_id;

        if (userPoints > 0) {
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
        } else {
            return res.status(403).json({
                message: "You don't have enough points to access this page",
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error occurred",
        });
    }
};

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


