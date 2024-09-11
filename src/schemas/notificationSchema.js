import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    receiverId: {type: String, required: true},
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: false
    },
    title: {type: String, required: true},
    content: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
});

export default mongoose.model('Notification', NotificationSchema);
