import dotenv from "dotenv";
import AdminModel from "../../models/adminModel.js";
import {createToken} from "../../middlewares/authMiddleware.js";

dotenv.config();

const handleErrors = (err) => {
    let e;

    if (err.message === 'u') {
        e = 'u';
    }

    if (err.message === 'p') {
        e = 'p';
    }

    return e;
}

const maxAgeInSeconds = 2 * 60 * 60;
const maxAgeInMilliseconds = maxAgeInSeconds * 1000;

const getLoginPage = (req, res) => {
    res.render('pages/login');
}

const postLogin = async (req, res) => {
    try {
        const {username, password} = req.body;

        const admin = await AdminModel.login(username, password);
        const token = await createToken(admin,maxAgeInSeconds);

        res.cookie('authenticated', token, {httpOnly: true, secure: false, maxAge: maxAgeInMilliseconds});
        res.json({status: 200, e: null});
    } catch (error) {
        const errors = handleErrors(error);
        res.json({status: 400, e: errors});
    }
}

const postSignup = async (req, res) => {
    try {
        const {username, password, email} = req.body;

        await AdminModel.create({
            username: username,
            password: password,
            email: email,
        });
        res.status(200).json('Successful');
    } catch (error) {
        const errors = handleErrors(error);
        res.status(500).json({errors});
    }
}

const getLogout = async (req, res) => {
    res.cookie('authenticated', '', {maxAge: 1});
    res.redirect('/login');
}

export default {
    getLoginPage,
    postLogin,
    postSignup,
    getLogout
};