import mailjet from 'node-mailjet';
import dotenv from 'dotenv';

dotenv.config();

const mailjetClient = new mailjet.Client({
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_SECRET_KEY,
});

const sendNotification = async (email, subject, text) => {
    const request = mailjetClient
        .post('send', {version: 'v3.1'})
        .request({
            Messages: [
                {
                    From: {
                        Email: process.env.FROM_EMAIL,
                        Name: process.env.FROM_NAME
                    },
                    To: [
                        {
                            Email: email
                        }
                    ],
                    Subject: subject,
                    TextPart: text
                }
            ]
        });

    try {
        const result = await request;
        console.log(`Notification sent to ${email}:`, result.body);
    } catch (error) {
        console.error(`sendNotification ERROR: ${error.message}`);
        throw error;
    }
}

const sendOTP = async (email, subject, otp) => {
    const request = mailjetClient
        .post('send', {version: 'v3.1'})
        .request({
            Messages: [
                {
                    From: {
                        Email: process.env.FROM_EMAIL,
                        Name: process.env.FROM_NAME
                    },
                    To: [
                        {
                            Email: email
                        }
                    ],
                    Subject: subject,
                    TextPart: `Mã xác thực của bạn là: ${otp}.\nVui lòng xác thực trong vòng 10 phút\nĐây là tin nhắn hệ thống, vui lòng không trả lời mail này`
                }
            ]
        });

    try {
        const result = await request;
        console.log(`OTP sent to ${email}`);
    } catch (error) {
        console.error(`sendOTP ERROR: ${error.message}`);
        throw error;
    }
};

export { sendNotification, sendOTP };