const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

//Get current user's profile
router.get("/me",auth,async (req,res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        res.json(user);
    } catch (error) {
        res.status(500).json({message:"Error fetching profile"});
    }
});

//Update profile
router.put("/me",auth,async(req,res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.userId,req.body, {new:true}).select("-password");
        res.json(updated);
    } catch (error) {
        res.status(500).json({message: "Error updating profile"});
    }
});

router.put("/plan", auth, async (req,res) => {
    try {
        const {plan} = req.body;
        if(!["free","premium"].includes(plan)){
            return res.status(400).json({message:"Invalid plan selected"});
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            {plan},
            {new:true}
        );

        res.json({message:"Plan updated successfully",plan:user.plan});
    } catch (error) {
        res.status(500).json({message:"Error updating plan"});
    }
});

module.exports = router;