import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { createLogger, format, transports } from "winston";
import { PERSONALITY_CONTEXT } from "../constants/AI/index";
import { sendError, sendResponse } from "../utils/helperFunction";

// Logger configuration
const logger = createLogger({
    level: "info",
    format: format.combine(format.timestamp(), format.json()),
    transports: [new transports.Console()],
});

// Input validation schema
const blogInputSchema = z.object({
    title: z.string().max(200, "Title must be 200 characters or less").optional(),
    body: z
        .string()
        .min(1, "Body is required")
        .max(5000, "Body must be 5000 characters or less"),
    tone: z
        .enum([
            "professional",
            "casual",
            "persuasive",
            "educational",
            "storytelling",
            "inspirational",
        ])
        .optional(),
    customInstructions: z
        .string()
        .max(500, "Custom instructions must be 500 characters or less")
        .optional(),
}).refine(
    (data) => !(data.tone && data.customInstructions),
    "Cannot provide both tone and custom instructions",
);

// Interface for parsed AI response
interface IParsedAIResponse {
    Title: string;
    Body: string;
}


const tonePrompts: Record<string, string> = {
    professional: "Enhance the blog content to maintain a formal, professional tone suitable for business or academic audiences.",
    casual: "Enhance the blog content to use a relaxed, conversational tone, as if speaking to a friend.",
    persuasive: "Enhance the blog content to be compelling and persuasive, encouraging the reader to take action or agree with the viewpoint.",
    educational: "Enhance the blog content to be clear, informative, and structured for teaching or explaining concepts.",
    storytelling: "Enhance the blog content to follow a narrative structure, engaging the reader with a compelling story.",
    inspirational: "Enhance the blog content to be uplifting and motivational, inspiring the reader to feel empowered.",
};

const defaultInstructions =
    "Enhance the provided blog content by improving clarity, coherence, and engagement while preserving the original meaning. Optimize the title to be concise and attention-grabbing. Ensure the body is well-structured and suitable for the intended audience.";

export const llmBlogProcessing = async (req: Request, res: Response) => {

    const validationResult = blogInputSchema.safeParse(req.body);
    if (!validationResult.success) {
        logger.error("Input validation failed", { errors: validationResult.error.issues });
        return sendResponse(res, {
            statusCode: StatusCodes.BAD_REQUEST,
            msg: "Invalid input: " + validationResult.error.issues.map((e) => e.message).join(", "),
            success: false,
        });
    }

    const { title, body, tone, customInstructions } = validationResult.data;

    const sanitizedTitle = title ? sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} }) : undefined;
    const sanitizedBody = sanitizeHtml(body, { allowedTags: [], allowedAttributes: {} });
    const sanitizedCustomInstructions = customInstructions
        ? sanitizeHtml(customInstructions, { allowedTags: [], allowedAttributes: {} })
        : undefined;

    if (!process.env.OPENROUTER_API_KEY) {
        logger.error("Missing OPENROUTER_API_KEY");
        return sendResponse(res, {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
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
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",
                messages: [
                    { role: "system", content: PERSONALITY_CONTEXT },
                    { role: "user", content: prompt },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
                timeout: 10000,
            },
        );

        const data = response.data;
        if (!data?.choices?.[0]?.message?.content) {
            logger.error("Invalid response structure from LLM API", { response: data });
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                msg: "Invalid response structure from LLM API",
                success: false,
            });
        }

        const content = data.choices[0].message.content;
        let parsedResponse: IParsedAIResponse;

        try {
            const cleanContent = content
                .replace(/```json\n?|\n?```/g, "")
                .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
                .trim();
            parsedResponse = JSON.parse(cleanContent);
            logger.info("Successfully parsed JSON response", { title: parsedResponse.Title });
        } catch (jsonError) {
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
            } else {
                logger.error("Fallback parsing failed", { content });
                return sendResponse(res, {
                    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                    msg: "LLM response not in expected JSON format and could not be parsed",
                    success: false,
                });
            }
        }

        const { Title, Body } = parsedResponse;
        if (!Title || !Body) {
            logger.error("Missing required keys in parsed response", { parsedResponse });
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                msg: "Response missing required keys (Title or Body)",
                success: false,
            });
        }

        const responseData = { title: Title, body: Body };
        logger.info("LLM processing successful", { responseData });

        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            msg: "Blog content enhanced successfully",
            data: responseData,
            success: true,
        });
    } catch (error: unknown) {
        logger.error("Error during LLM processing", { error });
        return sendError(res, { error });
    }
};