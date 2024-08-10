import mongoose from 'mongoose';

const ChatRoomSchema = new mongoose.Schema({
    members: Array,
    createAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('ChatRoom', ChatRoomSchema);