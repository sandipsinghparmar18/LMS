import { Router } from "express";
import { 
    createCheckoutSession, 
    getAllPurchasedCourse, 
    getCourseDetailWithPurchaseStatus, 
    stripeWebhook } from "../controllers/coursePurchase.controller.js";

import {verifyJWT} from '../middlewares/auth.middleware.js'

const router=Router();


router.route("/checkout/create-checkout-session").post(verifyJWT, createCheckoutSession);
router.route("/webhook").post(express.raw({type:"application/json"}), stripeWebhook);
router.route("/course/:courseId/detail-with-status").get(verifyJWT,getCourseDetailWithPurchaseStatus);

router.route("/").get(verifyJWT,getAllPurchasedCourse);

export default router;