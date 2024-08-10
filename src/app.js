import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from "dotenv";
import mongoose from "mongoose";
import configViewEngine from "./config/viewEngine.js";
import staticFile from "./config/staticFile.js";
import web from "./routes/web.js";
import auth from "./routes/auth.js";
import authMiddleware from "./middlewares/authMiddleware.js";
import authController from "./controllers/authController.js";

const app = express();
dotenv.config();

configViewEngine(app);
staticFile(app);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

const connect = async () => {
    try {
        await mongoose.connect(process.env.DATABASE);
        console.log('Connect to MongoDB successful');
    } catch (error) {
        console.error('Connect to MongoDB fail: ', error.message);
    }
}
connect();

app.use('/auth', auth);
app.use('/', authMiddleware.requireAuthentication, web);


app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.send('error');
});

export default app;

