import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../../shared/async-handler.js";
import * as controller from "./contact.controller.js";

export const contactRouter = Router();

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 5,                  // 5 submissions per IP per hour
    standardHeaders: "draft-7",
    legacyHeaders: false,
});

contactRouter.post("/", limiter, asyncHandler(controller.submit));