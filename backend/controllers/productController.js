const Product = require("../models/Product");


exports.saveProduct = async (req,res) => {
    const {userId, description, hsn, rate, discount, tax} = req.body;
    if(!userId || !description) return res.status(400).json({message: "Missing fields"})
    try {
        const existing = await Product.findOne({userId, description});

        if(existing){
            existing.hsn = hsn;
            existing.rate = rate;
            existing.discount = discount;
            existing.tax = tax;
            await existing.save();
        }else{
            await Product.create({userId, description, hsn, rate, discount, tax});
        }
        res.status(200).json({message: "Product saved"});
    } catch (err) {
        res.status(500).json({message:"Error saving product", error: err.message});
    }
}

exports.bulkSaveProduct = async (req,res) => {
    const {userId, products} = req.body;

    if(!userId || !products || !Array.isArray(products) || products.length === 0){
        return res.status(400).json({message: "Invalid input data"});
    }
    try {
        const uniqueProducts = products.map(p => ({
            userId,
            description:p.description,
            hsn: p.hsn || "",
            rate: p.rate || 0,
            discount: p.discount || 0,
            tax: p.tax || 0
        }));
        const filterd = uniqueProducts.filter(p => p.description);
        await Product.insertMany(filterd);
        res.status(200).json({message: "Products saved"});
    } catch (err) {
        res.status(500).json({message: "Product save failed", error: err.message});
    }
};

exports.getAllProducts = async (req,res) => {
    const userId = req.userId;
    try {
        const products = await Product.find({userId});
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({message: "Error fetching products", error: err.message});
    }
}

exports.getProduct = async (req,res) => {
    const userId = req.userId;
    const {description} = req.query;

    if(!description){
        return res.status(400).json({message: "Missing description"})
    }

    try {
       const products = await Product.findOne({userId, description:{$regex: new RegExp(`^${description}$`,"i")}});
       if(!products){
        return res.status(404).json({message: "Product not found"});
       }
       res.status(200).json(products);
    } catch (err) {
        res.status(500).json({message: "Error fetching products", error:err.message});
    }
};