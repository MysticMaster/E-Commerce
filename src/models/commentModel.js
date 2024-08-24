import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    postId: {type: String, required: true},
    commentOwner: {type: String, required: true},
    content: String,
    imageKey: [String],
    videoKey:[String],
    favoriteCount: {type: Number, default: 0},
    createdAt: {type: Date, default: Date.now},
});

export default mongoose.model('Comment', CommentSchema);