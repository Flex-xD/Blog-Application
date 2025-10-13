"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const config_1 = __importDefault(require("./config/config"));
const cors_1 = __importDefault(require("cors"));
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes"));
const LLMProcessing_1 = __importDefault(require("./routes/LLMProcessing"));
const userActivityRoutes_1 = __importDefault(require("./routes/userActivityRoutes"));
const socialRoutes_1 = __importDefault(require("./routes/socialRoutes"));
dotenv_1.default.config();
const port = process.env.PORT || 3000;
const app = (0, express_1.default)();
const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
};
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)(corsOptions));
app.use("/api/auth", authRoutes_1.default);
app.use("/api/llm", LLMProcessing_1.default);
app.use("/api/blog", blogRoutes_1.default);
app.use("/api/user", userActivityRoutes_1.default);
app.use("/api/social", socialRoutes_1.default);
app.listen(port, () => {
    (0, config_1.default)();
    console.log(`Server running on port : ${port}`);
});
