import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    chatRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true,
    },
    senderId: {
        type: String,
        required: true,
    },
    images: [String],
    videos: [String],
    content: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Message', MessageSchema);
