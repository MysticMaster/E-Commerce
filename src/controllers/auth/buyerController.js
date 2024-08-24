import dotenv from "dotenv";
import User from "../../models/userModel.js";
import Buyer from "../../models/buyerModel.js";
import {createToken} from "../../middlewares/authMiddleware.js";
import {HTTPResponse} from "../../services/HTTPResponse.js";
import {sendOTP} from "../../config/mailjet.js";
import {getOTPFromRedis, deleteOTPFromRedis, saveOTPToRedis} from "../../config/redis.js";
import generateRandomOTP from "../../services/generateRandomOTP.js";
import generateRandomString from "../../services/generateRandomString.js";

dotenv.config();

const maxAge = 30 * 24 * 60 * 60;

const postLogin = async (req, res) => {
    try {
        const {email} = req.body;
        if (!email) {
            return res.status(400).json(HTTPResponse(400, {}, 'Email is required'));
        }

        const user = await User.findOne({email: email});
        if (!user) {
            return res.status(404).json(HTTPResponse(404, {}, 'User not found'));
        }

        const otp = generateRandomOTP(6);
        await saveOTPToRedis(email, otp);
        await sendOTP(email, 'Mã xác nhận đăng nhập tài khoản', otp);
        res.status(200).json(HTTPResponse(200, {}, 'OTP sent successfully'));
    } catch (error) {
        console.log(`postLogin ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const postVerifyLoginOTP = async (req, res) => {
    try {
        const {otp, email} = req.body;
        if (!otp || !email) {
            return res.status(400).json(HTTPResponse(400, {}, 'OTP and email are required'));
        }

        const otpConfirm = await getOTPFromRedis(email);
        if (!otpConfirm) {
            return res.status(400).json(HTTPResponse(400, {}, 'OTP not found or expired'));
        }

        if (otp !== otpConfirm) {
            return res.status(400).json(HTTPResponse(400, {}, 'OTP is incorrect'));
        }

        await deleteOTPFromRedis(email);

        const user = await User.findOne({email: email});
        const buyer = await Buyer.findOne({userId: user.userId});

        if (!buyer) {
            return res.status(404).json(HTTPResponse(404, {}, 'Buyer not found'));
        }

        const token = await createToken(buyer, maxAge);
        res.status(200).json(HTTPResponse(200, {token: token}, 'Login Successful'));

    } catch (error) {
        console.log(`postVerifyLoginOTP ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const postSignup = async (req, res) => {
    try {
        const {email} = req.body;
        if (!email) {
            return res.status(400).json(HTTPResponse(400, {}, 'Email is required'));
        }

        const user = await User.findOne({email: email});
        if (user) {
            return res.status(409).json(HTTPResponse(409, {}, 'Email is valid'));
        }

        const otp = generateRandomOTP(6);
        await saveOTPToRedis(email, otp);
        await sendOTP(email, 'Mã xác nhận đăng ký tài khoản', otp);
        res.status(200).json(HTTPResponse(200, {}, 'OTP sent successfully'));
    } catch (error) {
        console.log(`postSignup ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

const postVerifySignupOTP = async (req, res) => {
    try {
        const {otp, email} = req.body;
        if (!otp || !email) {
            return res.status(400).json(HTTPResponse(400, {}, 'OTP and email are required'));
        }

        const otpConfirm = await getOTPFromRedis(email);
        if (!otpConfirm) {
            return res.status(400).json(HTTPResponse(400, {}, 'OTP not found or expired'));
        }

        if (otp !== otpConfirm) {
            return res.status(400).json(HTTPResponse(400, {}, 'OTP is incorrect'));
        }

        await deleteOTPFromRedis(email);

        const user = await User.create({userId: generateRandomString(16), email: email});
        await Buyer.create({userId: user.userId, fullName: generateRandomString(10)});

        res.status(200).json(HTTPResponse(200, {}, 'Signup Successful'));

    } catch (error) {
        console.log(`postVerifySignupOTP ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

export default {postLogin, postVerifyLoginOTP, postSignup, postVerifySignupOTP};