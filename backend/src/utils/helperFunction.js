"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendResponse = exports.createApiResponse = void 0;
const utils_1 = require("../utils");
const createApiResponse = ({ statusCode, success, msg, data }) => {
    return {
        statusCode,
        success,
        msg,
        data
    };
};
exports.createApiResponse = createApiResponse;
const sendResponse = (res, { statusCode, success, msg, data }) => {
    return res.status(statusCode).json({ statusCode, success, msg, data });
};
exports.sendResponse = sendResponse;
const sendError = (res, { statusCode = 500, message = "Something went wrong", error, }) => {
    const errorMessage = error instanceof Error ? error.message : message;
    console.log(error);
    utils_1.logger.error("❌ Error:", errorMessage);
    return res.status(statusCode).json({
        statusCode,
        success: false,
        msg: errorMessage,
        data: null,
    });
};
exports.sendError = sendError;
