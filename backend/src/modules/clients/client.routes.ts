import { Router } from "express";
import { asyncHandler } from "../../shared/async-handler.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { requireOrg } from "../../middleware/require-org.js";
import { authorize } from "../../middleware/authorize.js";
import * as controller from "./client.controller.js";

export const clientsRouter = Router();

// Every route below requires a signed-in user with an active org.
clientsRouter.use(requireAuth, requireOrg);

clientsRouter.get(
    "/",
    authorize("clients.read"),
    asyncHandler(controller.list),
);

clientsRouter.get(
    "/:id",
    authorize("clients.read"),
    asyncHandler(controller.detail),
);

clientsRouter.post(
    "/",
    authorize("clients.create"),
    asyncHandler(controller.create),
);

clientsRouter.patch(
    "/:id",
    authorize("clients.update"),
    asyncHandler(controller.update),
);

clientsRouter.delete(
    "/:id",
    authorize("clients.delete"),
    asyncHandler(controller.archive),
);