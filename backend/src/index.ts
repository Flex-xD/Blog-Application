import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser" ;
import authRouter from "./routes/authRoutes";
import connectDB from "./config/config";
import cors from "cors";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

const corsOptions = {
    origin:process.env.CLIENT_URL ,
    credentials:true,
}
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api/auth" , authRouter);

app.listen(port , () => {
    connectDB()
    console.log(`Server running on PORT : ${port}`);
})