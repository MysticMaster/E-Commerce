import express from "express";
import adminController from "../../controllers/auth/adminController.js";
import buyerController from "../../controllers/auth/buyerController.js";
import vendorController from "../../controllers/auth/vendorController.js";

const router = express.Router();

router.get('/', adminController.getLoginPage);
router.post('/login', adminController.postLogin);
router.post('/signup', adminController.postSignup);
router.delete('/logout', adminController.deleteLogout);

router.post('/buyers/login', buyerController.postLogin);
router.post('/buyers/signup', buyerController.postSignup);
router.post('/buyers/verify', buyerController.postVerifyOTP);

router.post('/vendors/login', vendorController.postLogin);
router.post('/vendors/signup', vendorController.postSignup);
router.post('/vendors/verify', vendorController.postVerifyOTP);

export default router;
