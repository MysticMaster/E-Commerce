import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    postOwner: {type: String, required: true},
    title: String,
    content: String,
    images: [String],
    videos: [String],
    likes: [String],
    approved: {type: Boolean, default: false},
    views: {type: Number, default: 0},
    createdAt: {type: Date, default: Date.now},
});

export default mongoose.model('Post', PostSchema);
