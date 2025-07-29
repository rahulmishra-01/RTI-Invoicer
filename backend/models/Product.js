const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    description: {type:String,required: true},
    hsn: {type:String},
    rate:{type:Number, required: true, min: 0},
    discount:{type: Number, default: 0, min: 0},
    tax:{type:Number, default: 0, min: 0},
}, {timestamps: true});

module.exports = mongoose.model("Product", productSchema);