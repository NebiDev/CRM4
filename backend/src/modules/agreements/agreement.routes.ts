import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireOrg } from "../../middleware/require-org.js";
import { authorize } from "../../middleware/authorize.js";
import * as controller from "./agreement.controller.js";

export const agreementsRouter = Router();

agreementsRouter.use(requireAuth, requireOrg);

agreementsRouter.get("/", authorize("files.read"), asyncHandler(controller.list));
agreementsRouter.get("/:id", authorize("files.read"), asyncHandler(controller.detail));
agreementsRouter.post("/", authorize("files.upload"), asyncHandler(controller.create));
agreementsRouter.delete("/:id", authorize("files.delete"), asyncHandler(controller.archive));