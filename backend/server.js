require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://rtinvoicer.netlify.app",
];

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    if(origin || allowedOrigins.includes(origin)){
        callback(null, true);
    }else{
        callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}));
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

//Payments Routes
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);

//MongoDB connection
const Port = process.env.PORT;
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected");
    app.listen(Port,() => {
        console.log(`Server running on port: http://localhost:${Port}`)
    })
}).catch((err) => {
    console.error("MongoDB Error",err)
})