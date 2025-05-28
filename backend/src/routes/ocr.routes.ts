import { Router } from "express";
import multer from "multer";
import { processDocument } from "../controllers/orc.controller";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("document"), processDocument);

export default router;
