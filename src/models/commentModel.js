import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    commentOwner: {type: String, required: true},
    comment: {type: String, required: true},
    imageKey: [String],
    imageUrl: [String],
    favoriteCount: {type: Number, default: 0},
    createdAt: {type: Date, default: Date.now},
});

export default mongoose.model('Comment', CommentSchema);