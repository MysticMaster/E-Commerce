import mongoose from 'mongoose';

const BuyerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    latitude: Number,
    longitude: Number,
    placeName: String,
    telephone: String,
    image: String,
    role: {
        type: String,
        default: 'buyer',
    },
    status: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Buyer', BuyerSchema);
