import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import axios, { AxiosError } from "axios";
import { PERSONALITY_CONTEXT } from "../constants/AI/index";

interface IParsedAIResponse {
    Title: string;
    Body: string;
}

export const llmBlogProcessing = async (req: Request, res: Response) => {
    const { prompt } = req.body as { prompt: string };
    if (!prompt || prompt.trim() === "" || prompt.length > 1000) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Prompt is required and must be under 1000 characters",
            success: false,
        });
    }

    if (!process.env.OPENROUTER_API_KEY) {
        console.error("Missing OPENROUTER_API_KEY in environment variables");
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Server configuration error",
            success: false,
        });
    }

    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'mistralai/mistral-7b-instruct:free',
                messages: [
                    { role: 'system', content: PERSONALITY_CONTEXT },
                    { role: 'user', content: prompt }
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            }
        );

        const data = response.data;
        if (!data?.choices?.[0]?.message?.content) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Invalid response structure from LLM API",
                success: false,
                raw: data,
            });
        }

        const content = data.choices[0].message.content;
        console.log("Raw AI Response:", content);

        let parsedResponse: IParsedAIResponse;
        try {
            const cleanContent = content
                .replace(/```json\n?|\n?```/g, '')
                .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
                .trim();
            parsedResponse = JSON.parse(cleanContent);
            console.log("Parsed JSON Response:", parsedResponse);
        } catch (jsonError) {
            console.error("JSON Parsing Error:", jsonError, "Raw Content:", content);

            const titleMatch = content.match(/Title:\s*"(.*?)"\s*(?:\n|$)/i);
            const bodyMatch = content.match(/Body:\s*([\s\S]*)/i);

            if (titleMatch && bodyMatch) {
                let body = bodyMatch[1].trim();
                body = body.replace(/Title:.*?\n\n?/i, '').replace(/Subtitle:.*?\n\n?/i, '').replace(/---\n\n?/, '').trim();
                parsedResponse = {
                    Title: titleMatch[1].trim(),
                    Body: body,
                };
                console.log("Parsed Fallback Response:", parsedResponse);
            } else {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: "LLM response not in expected JSON format and could not be parsed",
                    success: false,
                    raw: content,
                });
            }
        }

        const { Title, Body } = parsedResponse;
        if (!Title || !Body) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Response missing expected keys (Title, Body)",
                success: false,
                data: parsedResponse,
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "LLM processing successful",
            success: true,
            data: {
                title: Title,
                body: Body,
            },
        });

    } catch (error: unknown) {
        if (error instanceof AxiosError || error instanceof Error) {
            console.error("LLM Error:", error.message, { prompt: prompt });
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Internal Server Error",
                success: false,
                error: error instanceof AxiosError ? error.response?.data : error.message,
            });
        } else {
            console.error("LLM Error: Unknown error", { prompt: prompt });
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: "Internal Server Error",
                success: false,
                error: "Unknown error",
            });
        }
    }
};