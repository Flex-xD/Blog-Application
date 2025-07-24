import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser" ;
import authRouter from "./routes/authRoutes";
import connectDB from "./config/config";
dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth" , authRouter);

app.listen(port , () => {
    connectDB()
    console.log(`Server running on PORT : ${port}`);
})