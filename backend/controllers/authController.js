const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {generateOTP} = require("../utils/generateOTP");
const {sendOTP} = require("../utils/sendEmail");

const otpStore = {};

exports.signup = async (req,res) => {
    const {name,email,password} = req.body;
    try {
        const userExists = await User.findOne({email});
        if(userExists) return res.status(400).json({message: "User already exist"})
        
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = await User.create({name,email,password:hashedPassword});

        res.status(201).json({message:"Signup successful"});
    } catch (err) {
        res.status(500).json({message:"Signup Error", error:err.message})
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log(email)
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid Credentials" });

        const otp = generateOTP();

        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        await user.save();

        await sendOTP(email, otp);

        res.status(200).json({ success: true, message: "OTP sent to email", email });
    } catch (err) {
        res.status(500).json({ message: "Login error", error: err.message });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ message: "OTP not found or expired" });
        }

        if (Date.now() > user.otpExpires) {
            user.otp = "";
            user.otpExpires = "";
            await user.save();
            return res.status(400).json({ message: "OTP expired" });
        }

        if (user.otp !== otp) {
            return res.status(401).json({ message: "Invalid OTP" });
        }

        // Clear OTP fields
        user.otp = "";
        user.otpExpires = "";
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        res.status(500).json({ message: "OTP verification error", error: err.message });
    }
};

exports.resendOtp = async (req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user) return res.status(404).json({message:"User not found"});

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        await user.save();

        await sendOTP(email, otp);

        res.status(200).json({message: "OTP resent to email"});
    } catch (err) {
        res.status(500).json({message: "Resend OTP failed", error:err.message});
    }
};
