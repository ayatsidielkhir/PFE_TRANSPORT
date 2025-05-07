import express from "express";
import multer from "multer";
import { processDocument } from "../controllers/orc.controller";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // dossier temporaire

router.post("/upload", upload.single("document"), processDocument);

export default router;
