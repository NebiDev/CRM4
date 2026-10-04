import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireOrg } from "../../middleware/require-org.js";
import { authorize } from "../../middleware/authorize.js";
import * as controller from "./file.controller.js";

export const filesRouter = Router();

filesRouter.use(requireAuth, requireOrg);

filesRouter.get("/", authorize("files.read"), asyncHandler(controller.list));
filesRouter.post("/upload-url", authorize("files.upload"), asyncHandler(controller.requestUpload));
filesRouter.post("/confirm", authorize("files.upload"), asyncHandler(controller.confirmUpload));
filesRouter.get("/:id/download-url", authorize("files.read"), asyncHandler(controller.download));
filesRouter.delete("/:id", authorize("files.delete"), asyncHandler(controller.remove));