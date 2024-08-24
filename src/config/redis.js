import {createClient} from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    }
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Could not connect to Redis', err.message);
    }
};

const saveOTPToRedis = async (email, otp) => {
    const key = `otp:${email}`;
    const ttl = 600;

    try {
        await redisClient.set(key, otp, 'EX', ttl);
        console.log(`OTP saved for ${email}`);
    } catch (err) {
        console.error('Error saving OTP to Redis', err.message);
    }
};

const getOTPFromRedis = async (email) => {
    const key = `otp:${email}`;

    try {
        return await redisClient.get(key);
    } catch (err) {
        console.error('Error getting OTP from Redis', err.message);
        return null;
    }
};

const deleteOTPFromRedis = async (email) => {
    const key = `otp:${email}`;

    try {
        await redisClient.del(key);
        console.log(`OTP deleted for ${email}`);
    } catch (err) {
        console.error('Error deleting OTP from Redis', err.message);
    }
};

await connectRedis();

export {saveOTPToRedis, getOTPFromRedis, deleteOTPFromRedis};
