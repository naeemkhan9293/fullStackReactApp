import express from "express";
import { getSavedServices, saveService, removeSavedService } from "../controllers/savedServices";
import { protect } from "../middleware/auth";
import { checkAccess } from '../middleware/accessControl';

const router = express.Router();

router.route("/").get(protect, checkAccess('savedService', 'readOwn'), getSavedServices);
router.route("/:serviceId")
  .post(protect, checkAccess('savedService', 'createOwn'), saveService)
  .delete(protect, checkAccess('savedService', 'deleteOwn'), removeSavedService);

export default router;
