const mongoose = require("mongoose");
const palnSchema = new mongoose.Schema ({
  
    title : {
       type: String,
       require : true
    },
    description : {
        type: String,
        require : true
     },
    points:{
        type:Number,
        default:0,
        required:true
    },
    price:{
        type:Number,
        default:0,
        required:true
    },
},

{ timestamps: true });

module.exports = mongoose.model('Plan',palnSchema);
