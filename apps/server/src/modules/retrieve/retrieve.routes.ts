import express from "express";
import { retrieveController } from "./retrieve.controllers.js";

const router = express.Router();

router.get("/", retrieveController.getAllDocs);

export default router;
