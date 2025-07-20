const express = require("express");
const router = express.Router();
const razorpayInstance = require("../controllers/razorpay");

router.post("/create-order", async (req,res) => {
    const { amount, currency } = req.body;

    try {
        const options = {
            amount: amount * 100,
            currency: currency || "INR",
        };

        const order = await razorpayInstance.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating RazorPay order");
    }
});

module.exports = router;