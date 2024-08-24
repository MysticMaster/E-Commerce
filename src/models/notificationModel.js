import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    receiverId: {type: String, required: true},
    orderId: String,
    title: {type: String, required: true},
    content: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
});

export const NotificationModel = mongoose.model('Notification', NotificationSchema);