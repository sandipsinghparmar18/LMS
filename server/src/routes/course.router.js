import {Router} from 'express'
import { 
    createCourse, 
    createLecture, 
    editCourse, 
    editLecture, 
    getCourseById, 
    getCourseLecture, 
    getCreatorCourses, 
    getLectureById, 
    getPublishedCourse, 
    removeLecture, 
    searchCourse, 
    togglePublishCourse } from "../controllers/course.controller.js";

    import {upload} from '../middlewares/multer.middleware.js'
    import {verifyJWT} from '../middlewares/auth.middleware.js'

    const router = Router();

    router.route("/").post(verifyJWT,createCourse);
    router.route("/search").get(verifyJWT, searchCourse);
    router.route("/published-courses").get( getPublishedCourse);
    router.route("/").get(verifyJWT,getCreatorCourses);
    router.route("/:courseId").put(verifyJWT,upload.single("courseThumbnail"),editCourse);
    router.route("/:courseId").get(verifyJWT, getCourseById);
    router.route("/:courseId/lecture").post(verifyJWT, createLecture);
    router.route("/:courseId/lecture").get(verifyJWT, getCourseLecture);
    router.route("/:courseId/lecture/:lectureId").post(verifyJWT, editLecture);
    router.route("/lecture/:lectureId").delete(verifyJWT, removeLecture);
    router.route("/lecture/:lectureId").get(verifyJWT, getLectureById);
    router.route("/:courseId").patch(verifyJWT, togglePublishCourse);


export default router;