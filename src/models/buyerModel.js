import mongoose from 'mongoose';

const BuyerSchema = new mongoose.Schema({
    userId:{
      type: String,
      required: true,
    },
    fullName: {
        type: String,
        required: true
    },
    latitude: Number,
    longitude: Number,
    placeName: String,
    telephone: String,
    imageKey: String,
    role:{
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