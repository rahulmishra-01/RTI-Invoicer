require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

//Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth",authRoutes);

//Invoice Routes
const invoiceRoutes = require("./routes/invoice");
app.use("/api/invoices",invoiceRoutes);

//Profile Routes
const userRoutes = require("./routes/user");
app.use("/api/users",userRoutes)

//MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected");
    app.listen(5000,() => {
        console.log(`Server running on port: http://localhost:5000`)
    })
}).catch((err) => {
    console.error("MongoDB Error",err)
})