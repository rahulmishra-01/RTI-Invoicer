const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {generateOTP} = require("../utils/generateOTP");
const {sendOTP} = require("../utils/sendEmail");

const otpStore = {};
const OTP_EXPIRY = 5 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const COOLDOWN = 60 * 1000;

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

        if(user.otpLockedUntil && Date.now() < user.otpLockedUntil){
            const secondsLeft = Math.ceil((user.otpLockedUntil - Date.now()) / 1000);
            return res.status(429).json({message:`Please wait ${secondsLeft}s before requesting another OTP.`});
        }

        const otp = generateOTP();

        user.otp = otp;
        user.otpExpires = Date.now() + OTP_EXPIRY;
        user.otpAttempts = 0;
        user.otpLockedUntil = Date.now() + COOLDOWN;
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

        if (!user.otp || !user.otpExpires || Date.now() > user.otpExpires) {
            user.otp = undefined;
            user.otpExpires = undefined;
            user.otpAttempts = 0;
            await user.save();
            return res.status(400).json({ message: "OTP expired. Please login again." });
        }

        if (Date.now() > user.otpExpires) {
            user.otp = undefined;
            user.otpExpires = undefined;
            user.otpAttempts = 0;
            await user.save();
            return res.status(400).json({ message: "OTP expired" });
        }

        if(user.otpAttempts >= MAX_ATTEMPTS){
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(403).json({message: "Too many failed attempts. Try login again."});
        }

        if (user.otp !== otp) {
            user.otpAttempts += 1;
            await user.save();
            return res.status(401).json({ message: `Invalid OTP. ${MAX_ATTEMPTS - user.otpAttempts} attempts left.` });
        }

        // Clear OTP fields
        user.otp = undefined;
        user.otpExpires = undefined;
        user.otpAttempts = 0;
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

        if(user.otpExpires && Date.now() < user.otpExpires - 4 * 60 * 1000){
            const waitSeconds = Math.ceil((user.otpExpires - 4 * 60 * 1000 - Date.now()) /1000);
            return res.status(429).json({message: `Please wait ${waitSeconds}s before requesting a new OTP`})
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + OTP_EXPIRY;
        user.otpAttempts = 0;
        await user.save();

        await sendOTP(email, otp);

        res.status(200).json({message: "OTP resent to email"});
    } catch (err) {
        res.status(500).json({message: "Resend OTP failed", error:err.message});
    }
};

exports.forgotPassword = async (req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user) return res.status(404).json({message: "User not found"});

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        await user.save();

        await sendOTP(email, otp);
        
        res.status(200).json({message: "OTP sent for password reset",email});
    } catch (err) {
        res.status(500).json({message: "Error sending OTP", error: err.message})
    }
}

exports.verifyForgotOtp = async (req, res) => {
    const {email, otp} = req.body;
    const user = await User.findOne({email});
    if(!user) return res.status(404).json({message: "User not found"});

    if(!user.otp || !user.otpExpires || Date.now() > user.otpExpires){
        return res.status(400).json({message: "OTP expired or not found"});
    }

    if(user.otp !== otp){
        return res.status(401).json({message: "Invalid OTP"});
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({message: "OTP verified successfully"});
}

exports.resetPassword = async (req, res) => {
    const {email, newPassword} = req.body;

    try {
        const user = await User.findOne({email});
        if(!user) return res.status(404).json({message: "User not found"});

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({message: "Password reset successfully"});
    } catch (err) {
        res.status(500).json({message: "Error reseting password", error: err.message});
    }
}
