const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({

    firstname: {
        type: String,
        // required:true
    },
    lastname: {
        type: String,
        // required:true
    },
    username: {
        type: String,
        // required:true
    },
    phone: {
        type: String,
        // required:true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    points: {
        type: Number , 
        default:0
    },
    otp: {
        type: Number

    },
    otpExpiry: {
        type: String

    },
    total_questions: {
        type: Number
    },
    total_correct_answers: {
        type: Number
    },
    total_wrong_answers: {
        type: Number
    },
    completed_quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    is_verified: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    }
},

    { timestamps: true });


module.exports = mongoose.model('User', userSchema);
