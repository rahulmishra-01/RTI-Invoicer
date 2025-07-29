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
    invoiceNumber: {type: String, required: true, unique: true},
    invoiceDate: {type: Date, default: Date.now},
    buyerOrderNumber: {type: String, default: ""},
    buyerOrderDate: {type: Date, default: null},
    sellerDetails:{
        name: {type: String, required: true},
        address: {type: String, default: "", required: true},
        pincode: {type: String, default: "",},
        gstin: {type: String, default: "",},
        state: {type: String, default: "",},
        stateCode: {type: String, default: "",},
        pan: {type: String, default: ""},
        bankName: {type: String, default: "",},
        accountNumber: {type: String, default: "",},
        branch: {type: String, default: "",},
        ifsc: {type: String, default: "",},
    },
    buyerDetails:{
        name: {type: String, required: true},
        addressLine1: {type: String, required: true},
        addressLine2: {type: String, default: ""},
        pincode: {type: String, default: ""},
        state: {type: String, default: ""},
        stateCode: {type: String, default: ""},
        country: {type: String, default: ""},
        gstin: {type: String, default: ""},
        pan: {type: String, default: ""},
        email: {type: String, default: ""},
        phone: {type: String, default: ""}
    },
    shipTo:{
        name: {type: String, default: ""},
        addressLine1: {type: String, default: ""},
        addressLine2: {type: String, default: ""},
        pincode: {type: String, default: ""},
        state: {type: String, default: ""},
        stateCode: {type: String, default: ""},
        country: {type: String, default: ""},
        gstin: {type: String, default: ""},
        pan: {type: String, default: ""},
        email: {type: String, default: ""},
        phone: {type: String, default: ""}
    },
    products:[productSchema],
    totalAmount: Number,
    status:{type: String, enum:["paid","unpaid","overdue"], default: "unpaid"}
},{timestamps:true})

module.exports = mongoose.model("Invoice", invoiceSchema);