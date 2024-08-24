import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import {HTTPResponse} from "../services/HTTPResponse.js";

dotenv.config();

const createToken = async (user, maxAge) => {
    let payload = {}

    if (user.role === "vendor") {
        payload = {
            id: user._id.toString(),
            approved: user.approved,
            role: user.role
        }
    } else {
        payload = {
            id: user._id.toString(),
            role: user.role
        }
    }

    try {
        return jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: maxAge});
    } catch (error) {
        console.error('Error creating JWT token:', error);
        throw error;
    }
};

const verifyToken = async (token) => {
    try {
        return jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

const adminAuthentication = async (req, res, next) => {
    const token = req.cookies.authenticated;

    if (!token) {
        return res.redirect('/auth');
    }

    const decoded = await verifyToken(token);
    if (decoded.role === 'admin') {
        next();
    } else {
        return res.status(403).send(HTTPResponse(403, {}, 'Access denied'));
    }
}

const authentication = (requiredRole) => async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).send(HTTPResponse(401, {}, 'No token provided'));
    }

    try {
        const decodedToken = await verifyToken(token);

        if (requiredRole && decodedToken.role !== requiredRole) {
            return res.status(403).send(HTTPResponse(403, {}, 'Access denied'));
        }

        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).send(HTTPResponse(401, {}, 'Invalid token'));
    }
};

export {
    createToken,
    adminAuthentication,
    authentication
};
