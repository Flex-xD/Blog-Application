import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import axios, { AxiosError } from "axios";
import { PERSONALITY_CONTEXT } from "../constants/AI/index";
import { sendError, sendResponse } from "../utils/helperFunction";

interface IParsedAIResponse {
    Title: string;
    Body: string;
}

export const llmBlogProcessing = async (req: Request, res: Response) => {
    const { prompt } = req.body as { prompt: string };
    if (!prompt || prompt.trim() === "" || prompt.length > 1000) {
        return sendResponse(res, {
            statusCode: StatusCodes.BAD_REQUEST,
            msg: "Prompt is required and must be under 1000 characters",
            success: false
        })
    }

    if (!process.env.OPENROUTER_API_KEY) {
        return sendResponse(res, {
            statusCode: StatusCodes.NOT_FOUND,
            msg: "Server configuration error !",
            success: false
        })
    }

    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'openai/gpt-4o-mini',
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
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                msg: "Invalid response structure from LLM API",
                success: false
            })
        }

        const content = data.choices[0].message.content;
        let parsedResponse: IParsedAIResponse;
        try {
            const cleanContent = content
                .replace(/```json\n?|\n?```/g, '')
                .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
                .trim();
            parsedResponse = JSON.parse(cleanContent);
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
                return sendResponse(res, {
                    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                    msg: "LLM response not in expected JSON format and could not be parsed",
                    success: false
                })
            }
        }

        const { Title, Body } = parsedResponse;
        if (!Title || !Body) {
            return sendResponse(res, {
                statusCode: StatusCodes.BAD_REQUEST,
                msg: "Response missing keys expected !",
                success: false
            })
        }
        const responseData = {
            title:Title ,
            body:Body
        }
        console.log(responseData);
        return sendResponse(res, {
            statusCode: StatusCodes.OK,
            msg: "LLM Processing successfull !",
            data: responseData, 
            success: false
        })

    } catch (error: unknown) {
        return sendError(res, { error })
    };
}