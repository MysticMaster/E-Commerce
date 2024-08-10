import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

const createNodemailerTransport = async () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_ADDRESS,
            pass: process.env.MAIL_PASSWORD
        }
    });
};

export default createNodemailerTransport;