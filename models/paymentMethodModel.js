const mongoose = require("mongoose");
const paymentMethodSchema = new mongoose.Schema ({

    image:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    key_id:{
        type:String,
        required:true
    },
    key_secret:{
        type:String,
        required:true
    },
    is_enable:{
        type:Number,
        default:0
    }
},

{ timestamps: true });

module.exports = mongoose.model('PaymentMethod',paymentMethodSchema);