import express from "express";
import { getSavedServices, saveService, removeSavedService } from "../controllers/savedServices";
import { protect } from "../middleware/auth";

const router = express.Router();

router.route("/").get(protect, getSavedServices);
router.route("/:serviceId").post(protect, saveService).delete(protect, removeSavedService);

export default router;
