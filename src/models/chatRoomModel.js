import mongoose from 'mongoose';

const ChatRoomSchema = new mongoose.Schema({
    members: [String],
    status: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('ChatRoom', ChatRoomSchema);