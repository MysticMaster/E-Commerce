import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import logger from 'morgan';
import dotenv from "dotenv";
import mongoose from "mongoose";
import configViewEngine from "./config/viewEngine.js";
import staticFile from "./config/staticFile.js";
import web from "./routes/web/adminRoute.js";
import auth from "./routes/auth/authRoute.js";
import vendor from "./routes/api/vendorRoute.js";
import buyer from "./routes/api/buyerRoute.js";
import {adminAuthentication, authentication} from "./middlewares/authMiddleware.js";
import formatDateTime from "./services/formatDateTime.js";

const app = express();
dotenv.config();

configViewEngine(app);
staticFile(app)
app.locals.formatDateTime = formatDateTime;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

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
app.use('/api/v1/vendors', authentication('vendor'), vendor);
app.use('/api/v1/buyers', authentication('buyer'), buyer);
app.use('/', adminAuthentication, web);


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

