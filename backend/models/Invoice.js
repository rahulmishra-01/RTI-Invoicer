const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    description:String,
    hsn:String,
    quantity:Number,
    rate:Number,
    amount:Number,
    discount:Number,
    tax:Number
});

const invoiceSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId, ref: "User", required:true},
    invoiceNumber: String,
    invoiceDate: Date,
    buyerOrderNumber: String,
    buyerOrderDate: Date,
    sellerDetails:{
        name: String,
        address: String,
        pincode: String,
        gstin: String,
        state: String,
        stateCode: String,
        pan: String,
        bankName: String,
        accountNumber: String,
        branch: String,
        ifsc: String
    },
    buyerDetails:{
        name: String,
        address:String
    },
    shipTo:{
        name:String,
        address: String
    },
    products:[productSchema],
    totalAmount: Number,
    status:{type: String, enum:["paid","unpaid","overdue"], default: "unpaid"}
},{timestamps:true})

module.exports = mongoose.model("Invoice", invoiceSchema);