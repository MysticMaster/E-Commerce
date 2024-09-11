import firebase from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const fcmPath = resolve('src/config/fcm.json');
const fcm = JSON.parse(readFileSync(fcmPath, 'utf8'));

firebase.initializeApp({
    credential: firebase.credential.cert(fcm),
});

const sendDataMessage = async (fcmToken, data) => {
    const message = {
        data: data,
        token: fcmToken
    };

    try {
        const response = await firebase.messaging().send(message);
        console.log('Successfully sent data message:', response);
    } catch (error) {
        console.log('Error sending data message:', error);
    }
};


const sendNotification = async (fcmToken, title, body) => {
    const message = {
        notification: {
            title: title,
            body: body
        },
        token: fcmToken
    };

    try {
        const response = await firebase.messaging().send(message);
        console.log('Successfully sent message:', response);
    } catch (error) {
        console.log('Error sending message:', error);
    }
};

export {
    sendDataMessage,
    sendNotification
}
