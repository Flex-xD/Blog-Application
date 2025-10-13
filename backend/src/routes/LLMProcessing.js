"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AIController_1 = require("../controllers/AIController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const LLMRouter = (0, express_1.Router)();
LLMRouter.post("/ai-enhancing", authMiddleware_1.default, AIController_1.llmBlogProcessing);
exports.default = LLMRouter;
