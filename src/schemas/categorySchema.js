import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    thumbnail: String,
    privateAttributes: [mongoose.Schema.Types.Mixed],
    status: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Category', CategorySchema);
