import mongoose from 'mongoose';

const BuyerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    latitude: Number,
    longitude: Number,
    placeName: String,
    telephone: String,
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
})