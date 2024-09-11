import mongoose from 'mongoose';

const ChatRoomSchema = new mongoose.Schema({
    members: [String],
    hide: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('ChatRoom', ChatRoomSchema);
