import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireOrg } from "../../middleware/require-org.js";
import { authorize } from "../../middleware/authorize.js";
import * as controller from "./task.controller.js";

export const tasksRouter = Router();

tasksRouter.use(requireAuth, requireOrg);

tasksRouter.get("/", authorize("tasks.read"), asyncHandler(controller.list));
tasksRouter.get("/:id", authorize("tasks.read"), asyncHandler(controller.detail));
tasksRouter.post("/", authorize("tasks.create"), asyncHandler(controller.create));
tasksRouter.patch("/:id", authorize("tasks.update"), asyncHandler(controller.update));
tasksRouter.delete("/:id", authorize("tasks.delete"), asyncHandler(controller.archive));