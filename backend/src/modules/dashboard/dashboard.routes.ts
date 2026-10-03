import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireOrg } from "../../middleware/require-org.js";
import * as controller from "./dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth, requireOrg);

dashboardRouter.get("/summary", asyncHandler(controller.summary));
dashboardRouter.get("/activity", asyncHandler(controller.activity));