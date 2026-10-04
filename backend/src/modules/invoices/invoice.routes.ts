import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireOrg } from "../../middleware/require-org.js";
import { authorize } from "../../middleware/authorize.js";
import * as controller from "./invoice.controller.js";

export const invoicesRouter = Router();

invoicesRouter.use(requireAuth, requireOrg);

invoicesRouter.get("/", authorize("invoices.read"), asyncHandler(controller.list));
invoicesRouter.get("/:id", authorize("invoices.read"), asyncHandler(controller.detail));
invoicesRouter.post("/", authorize("invoices.create"), asyncHandler(controller.create));
invoicesRouter.patch("/:id", authorize("invoices.update"), asyncHandler(controller.update));
invoicesRouter.post("/:id/transition", authorize("invoices.update"), asyncHandler(controller.transition));
invoicesRouter.post("/:id/pdf", authorize("invoices.update"), asyncHandler(controller.generatePdf));