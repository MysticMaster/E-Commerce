import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    postId: {type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true},
    commentOwner: {type: String, required: true},
    content: String,
    images: [String],
    videos: [String],
    likes: [String],
    createdAt: {type: Date, default: Date.now},
});

export default mongoose.model('Comment', CommentSchema);
