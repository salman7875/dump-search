import express from "express";
import { uploadController } from "./upload.controllers.js";
import { multerUpload } from "../../libs/multer/index.js";

const router = express.Router();

router.post("/", multerUpload.single("document"), uploadController.uploadDoc);

export default router;
