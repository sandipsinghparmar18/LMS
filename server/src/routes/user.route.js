import { Router } from "express";
import { 
    getUserProfile, 
    login, 
    logout, 
    register, 
    updateProfile } from "../controllers/user.controller.js";

import {upload} from '../middlewares/multer.middleware.js'
import {verifyJWT} from '../middlewares/auth.middleware.js'

const router=Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(verifyJWT, getUserProfile);
router.route("/profile/update").put(
    verifyJWT, 
    upload.single("profilePhoto"), 
    updateProfile);



export default router