"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmBlogProcessing = void 0;
const http_status_codes_1 = require("http-status-codes");
const axios_1 = __importDefault(require("axios"));
const zod_1 = require("zod");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const winston_1 = require("winston");
const index_1 = require("../constants/AI/index");
const helperFunction_1 = require("../utils/helperFunction");
const logger = (0, winston_1.createLogger)({
    level: "info",
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
    transports: [new winston_1.transports.Console()],
});
const blogInputSchema = zod_1.z.object({
    title: zod_1.z.string().max(200, "Title must be 200 characters or less").optional(),
    body: zod_1.z
        .string()
        .min(1, "Body is required")
        .max(5000, "Body must be 5000 characters or less"),
    tone: zod_1.z
        .enum([
        "professional",
        "casual",
        "persuasive",
        "educational",
        "storytelling",
        "inspirational",
    ])
        .optional(),
    customInstructions: zod_1.z
        .string()
        .max(500, "Custom instructions must be 500 characters or less")
        .optional(),
}).refine((data) => !(data.tone && data.customInstructions), "Cannot provide both tone and custom instructions");
const tonePrompts = {
    professional: "Enhance the blog content to maintain a formal, professional tone suitable for business or academic audiences.",
    casual: "Enhance the blog content to use a relaxed, conversational tone, as if speaking to a friend.",
    persuasive: "Enhance the blog content to be compelling and persuasive, encouraging the reader to take action or agree with the viewpoint.",
    educational: "Enhance the blog content to be clear, informative, and structured for teaching or explaining concepts.",
    storytelling: "Enhance the blog content to follow a narrative structure, engaging the reader with a compelling story.",
    inspirational: "Enhance the blog content to be uplifting and motivational, inspiring the reader to feel empowered.",
};
const defaultInstructions = "Enhance the provided blog content by improving clarity, coherence, and engagement while preserving the original meaning. Optimize the title to be concise and attention-grabbing. Ensure the body is well-structured and suitable for the intended audience.";
const llmBlogProcessing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const validationResult = blogInputSchema.safeParse(req.body);
    if (!validationResult.success) {
        logger.error("Input validation failed", { errors: validationResult.error.issues });
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
            msg: "Invalid input: " + validationResult.error.issues.map((e) => e.message).join(", "),
            success: false,
        });
    }
    const { title, body, tone, customInstructions } = validationResult.data;
    const sanitizedTitle = title ? (0, sanitize_html_1.default)(title, { allowedTags: [], allowedAttributes: {} }) : undefined;
    const sanitizedBody = (0, sanitize_html_1.default)(body, { allowedTags: [], allowedAttributes: {} });
    const sanitizedCustomInstructions = customInstructions
        ? (0, sanitize_html_1.default)(customInstructions, { allowedTags: [], allowedAttributes: {} })
        : undefined;
    if (!process.env.OPENROUTER_API_KEY) {
        logger.error("Missing OPENROUTER_API_KEY");
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            msg: "Server configuration error",
            success: false,
        });
    }
    const enhancementPrompt = tone
        ? tonePrompts[tone]
        : customInstructions
            ? `${defaultInstructions} Follow these specific instructions: ${sanitizedCustomInstructions}`
            : defaultInstructions;
    const prompt = `
    You are an AI assistant tasked with enhancing blog content. Below is the blog content to enhance:
    Title: ${sanitizedTitle || "No title provided"}
    Body: ${sanitizedBody}
    Instructions: ${enhancementPrompt}
    Return the enhanced content in JSON format with 'Title' and 'Body' keys. Ensure the response is valid JSON.
    `;
    logger.info("Sending request to OpenRouter API", { promptLength: prompt.length, tone, hasCustomInstructions: !!customInstructions });
    try {
        const response = yield axios_1.default.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "openai/gpt-4o-mini",
            messages: [
                { role: "system", content: index_1.PERSONALITY_CONTEXT },
                { role: "user", content: prompt },
            ],
        }, {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            timeout: 10000,
        });
        const data = response.data;
        if (!((_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content)) {
            logger.error("Invalid response structure from LLM API", { response: data });
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                msg: "Invalid response structure from LLM API",
                success: false,
            });
        }
        const content = data.choices[0].message.content;
        let parsedResponse;
        try {
            const cleanContent = content
                .replace(/```json\n?|\n?```/g, "")
                .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
                .trim();
            parsedResponse = JSON.parse(cleanContent);
            logger.info("Successfully parsed JSON response", { title: parsedResponse.Title });
        }
        catch (jsonError) {
            logger.warn("JSON parsing failed, attempting fallback parsing", { error: jsonError, content });
            const titleMatch = content.match(/Title:\s*"(.*?)"\s*(?:\n|$)/i);
            const bodyMatch = content.match(/Body:\s*([\s\S]*)/i);
            if (titleMatch && bodyMatch) {
                let body = bodyMatch[1].trim();
                body = body.replace(/Title:.*?\n\n?/i, "").replace(/Subtitle:.*?\n\n?/i, "").replace(/---\n\n?/, "").trim();
                parsedResponse = {
                    Title: titleMatch[1].trim(),
                    Body: body,
                };
                logger.info("Parsed fallback response", { parsedResponse });
            }
            else {
                logger.error("Fallback parsing failed", { content });
                return (0, helperFunction_1.sendResponse)(res, {
                    statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
                    msg: "LLM response not in expected JSON format and could not be parsed",
                    success: false,
                });
            }
        }
        const { Title, Body } = parsedResponse;
        if (!Title || !Body) {
            logger.error("Missing required keys in parsed response", { parsedResponse });
            return (0, helperFunction_1.sendResponse)(res, {
                statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                msg: "Response missing required keys (Title or Body)",
                success: false,
            });
        }
        const responseData = { title: Title, body: Body };
        logger.info("LLM processing successful", { responseData });
        return (0, helperFunction_1.sendResponse)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            msg: "Blog content enhanced successfully",
            data: responseData,
            success: true,
        });
    }
    catch (error) {
        logger.error("Error during LLM processing", { error });
        return (0, helperFunction_1.sendError)(res, { error });
    }
});
exports.llmBlogProcessing = llmBlogProcessing;
