import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

router.get('/', authController.getLoginPage);
router.post('/login', authController.postLogin);
router.post('/signup', authController.postSignup);
router.get('/logout', authController.getLogout);

export default router;