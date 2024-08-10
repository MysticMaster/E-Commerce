import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        unique: true,
        required: true,
    },
    imageKey: String,
    imageUrl: String,
    status: {
        type: Boolean,
        default: true,
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Category', CategorySchema);