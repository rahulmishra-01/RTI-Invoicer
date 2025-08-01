const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const jwt = require("jsonwebtoken");
const {generateInvoicePDF, generateInvoiceNumber} = require("../utils/generateInvoicePDF");
const invoiceController = require("../controllers/invoiceController");
// const authMiddleware = require("../")

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

//Get all invoices of the logged-in user
router.route("/user").get(authMiddleware,async (req,res) => {
    try {
        const invoices = await Invoice.find({userId: req.userId}).sort({createdAt: -1});
        res.json(invoices);
    } catch (error) {
        res.status(500).json({message:"Error fetching invoices"});
    }
});

router.post("/",authMiddleware, async (req,res) => {
    try {
        const invoiceNumber = await generateInvoiceNumber();
        const invoice = new Invoice({
            ...req.body,
            userId: req.userId,
            invoiceNumber
        });

        await invoice.save();
        res.status(201).json({message:"Invoice created successfully", invoice});
    } catch (error) {
        res.status(500).json({message:"Invoice creation failed",error:error.message});
    }
});

router.get("/new-invoice-number", async (req,res) => {
    try {
        const invoiceNumber = await generateInvoiceNumber();
        res.json({invoiceNumber});
    } catch (error) {
        res.status(500).json({error:"Failed to generate invoice number"});   
    }
})

router.get("/:id/pdf",authMiddleware, async (req,res) => {
    try {
        console.log("Token User ID:", req.userId);
        const invoice = await Invoice.findOne({_id:req.params.id, userId: req.userId});
        if(!invoice) {
             console.log("Invoice not found or does not belong to user");
            return res.status(404).json({message: "Invoice not found"})
        }

        const pdfBuffer = await generateInvoicePDF(invoice);
        console.log("PDF generated successfully, size:", pdfBuffer.length);
        res.set({
            "Content-Type":"application/pdf",
            "Content-Disposition": `attachment; filename=${invoice.invoiceNumber}.pdf`
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error("PDF error:", error.message);
        res.status(500).json({message: "PDF generation failed", error: error.message})
    }
});

router.get("/:id", authMiddleware, async (req,res) => {
    try {
        const invoice = await Invoice.findOne({_id:req.params.id, userId:req.userId});
        if(!invoice) return res.status(404).json({message: "Invoice not found"});
        res.json(invoice);
    } catch (err) {
        res.status(500).json({messge:"Failed to fetch invoice",error:err.message})
    }
});

router.delete("/:id",authMiddleware,async(req,res) => {
    try {
        const invoice = await Invoice.findOneAndDelete({_id:req.params.id,userId:req.userId});

        if(!invoice){
            return res.status(404).json({message:"Invoice not found or unauthorized"})
        }

        res.json({message:"Invoice deleted successfully"});
    } catch (error){
        console.error("Delete error:",error);
        res.status(500).json({message:"Error deleting invoice"});
    };
});

router.put("/:id", authMiddleware, invoiceController.updateInvoice);

module.exports = router;