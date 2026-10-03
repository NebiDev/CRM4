import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireOrg } from "../../middleware/require-org.js";
import { authorize } from "../../middleware/authorize.js";
import * as controller from "./project.controller.js";

export const projectsRouter = Router();

projectsRouter.use(requireAuth, requireOrg);

projectsRouter.get("/", authorize("projects.read"), asyncHandler(controller.list));
projectsRouter.get("/:id", authorize("projects.read"), asyncHandler(controller.detail));
projectsRouter.post("/", authorize("projects.create"), asyncHandler(controller.create));
projectsRouter.patch("/:id", authorize("projects.update"), asyncHandler(controller.update));
projectsRouter.delete("/:id", authorize("projects.delete"), asyncHandler(controller.archive));