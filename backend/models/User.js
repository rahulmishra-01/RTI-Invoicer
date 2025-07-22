const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    phone:{type:String, default: ""},
    address:{type:String,default:""},
    pinCode:{type:String,default:""},
    state:{type:String,default:""},
    district:{type:String,default:""},
    stateCode:{type:String,default:""},
    country:{type:String,default:""},
    company:{type:String,default:""},
    gstin:{type:String,default:""},
    pan:{type:String,default:""},
    bankName:{type:String,default:""},
    accountNumber:{type:String,default:""},
    ifsc:{type:String,default:""},
    branch:{type:String,default:""},
    plan:{
        type:String,
        enum:["free","premium"],
        default: "free",
    },
},{timestamps:true})
module.exports = mongoose.model("User",userSchema);