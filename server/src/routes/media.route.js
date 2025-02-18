import {Router} from "express";
import { 
    uploadVideo } from "../controllers/media.controller.js";

import {upload} from '../middlewares/multer.middleware.js'
import {verifyJWT} from '../middlewares/auth.middleware.js'

const router = Router();

router.route("/upload-video").post(verifyJWT,upload.single("file"), uploadVideo);
export default router;