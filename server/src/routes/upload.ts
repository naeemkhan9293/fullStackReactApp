import express from "express";
import { uploadAvatar, uploadServiceImage } from "../controllers/upload";
import { protect } from "../middleware/auth";
import { checkAccess } from "../middleware/accessControl";
import upload from "../config/multer";

const router = express.Router();

router.post(
  "/avatar",
  protect,
  checkAccess("profile", "updateOwn"),
  upload.single("avatar"),
  uploadAvatar
);
router.post(
  "/service",
  protect,
  checkAccess("service", "createOwn"),
  upload.single("image"),
  uploadServiceImage
);

export { router };
