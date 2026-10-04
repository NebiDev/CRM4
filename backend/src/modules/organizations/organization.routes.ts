import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireOrg } from "../../middleware/require-org.js";
import { authorize } from "../../middleware/authorize.js";
import { notifyInvitation } from "./organization.controller.js";

export const organizationsRouter = Router();

organizationsRouter.use(requireAuth, requireOrg);

organizationsRouter.post(
    "/notify-invitation",
    authorize("org.invite"),
    asyncHandler(notifyInvitation),
);