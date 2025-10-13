import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes";
import connectDB from "./config/config";
import cors from "cors";
import blogRouter from "./routes/blogRoutes";
import LLMRouter from "./routes/LLMProcessing";
import userActivityRouter from "./routes/userActivityRoutes";
import socialRoutes from "./routes/socialRoutes";


dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

const allowedOrigins = [
    'https://blog-application-frontend-hety.onrender.com',
    'http://localhost:5173'
];

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,

}

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/api/auth", authRouter);
app.use("/api/llm", LLMRouter);
app.use("/api/blog", blogRouter);
app.use("/api/user", userActivityRouter);
app.use("/api/social", socialRoutes);


app.listen(port, () => {
    connectDB()
    console.log(`Server running on port : ${port}`);
})