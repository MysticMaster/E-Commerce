import express from "express";
import adminController from "../../controllers/auth/adminController.js";
import buyerController from "../../controllers/auth/buyerController.js";
import vendorController from "../../controllers/auth/vendorController.js";

const router = express.Router();

router.get('/', adminController.getLoginPage);
router.post('/login', adminController.postLogin);
router.post('/signup', adminController.postSignup);
router.get('/logout', adminController.getLogout);

router.post('/buyer/login', buyerController.postLogin);
router.post('/buyer/login-verify', buyerController.postVerifyLoginOTP);
router.post('/buyer/signup', buyerController.postSignup);
router.post('/buyer/signup-verify', buyerController.postVerifySignupOTP);

router.post('/vendor/login', vendorController.postLogin);
router.post('/vendor/login-verify', vendorController.postVerifyLoginOTP);
router.post('/vendor/signup', vendorController.postSignup);
router.post('/vendor/signup-verify', vendorController.postVerifySignupOTP);

export default router;