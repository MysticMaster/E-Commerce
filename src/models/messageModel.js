import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    chatRoomId:{
        type:String,
        required: true,
    },
    senderId:{
        type: String,
        required: true,
    },
    content:{
        type: String,
        required:true,
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Message', MessageSchema);