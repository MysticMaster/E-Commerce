import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    postOwner:{type: String, required: true},
    title: String,
    content: String,
    imageKey: [String],
    videoKey: [String],
    favoriteCount:{type: Number, default:0},
    createdAt:{type: Date, default: Date.now},
});

export default mongoose.model('Post', PostSchema);