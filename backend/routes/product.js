const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
// const auth = require("../middleware/auth");
const productController = require("../controllers/productController");

const authMiddleware = (req,res,next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if(!token) return res.status(401).json({message: "Unauthorized"});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(403).json({message: "Invalid Token"});
    }
};

router.route("/").get(authMiddleware,productController.getProduct);
router.route("/all").get(authMiddleware,productController.getAllProducts);
router.route("/save").post(authMiddleware,productController.saveProduct);
router.route("/bulk-save").post(authMiddleware,productController.bulkSaveProduct);

module.exports = router;