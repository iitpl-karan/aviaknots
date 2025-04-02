const mongoose = require("mongoose");
const paymentMethodSchema = new mongoose.Schema({

    plan_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    order_id: {
        type: String,
        required: true
    },
    payment_id: {
        type: String,
        required: true
    },
    amount_paid: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        required: true
    },
    captured: {
        type: Boolean,
        required: true
    },
    status: {
        type: String,
        required: true
    }
},

    { timestamps: true });

module.exports = mongoose.model('Payment', paymentMethodSchema);