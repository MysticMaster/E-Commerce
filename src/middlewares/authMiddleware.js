import jwt from 'jsonwebtoken';
import AdminModel from "../models/adminModel.js";
import dotenv from "dotenv";

dotenv.config();

const requireAuthentication = async (req, res, next) => {
    const token = req.cookies.authenticated;
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
            if (err) {
                // console.log('ccc',err);
                res.redirect('/auth');
            } else {
                next();
            }
        });
    } else {
        res.redirect('/auth');
    }
}

const checkUser = async (req, res, next) => {
    const token = req.cookies.authenticated;
    if (token) {
        if (token) {
            jwt.verify(token, process.env.SECRET_KEY, async (err, decodedToken) => {
                if (err) {
                    //   console.log(err);
                    res.locals.user = null;
                    next();
                } else {
                    //    console.log(decodedToken);
                    res.locals.user = await AdminModel.findById(decodedToken.id);
                    next();
                }
            });
        } else {
            res.redirect('/auth');
        }
    } else {
        res.locals.user = null;
        next();
    }
}

export default {
    requireAuthentication,
    checkUser
};
