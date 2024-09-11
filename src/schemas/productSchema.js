import mongoose from 'mongoose';

const ClassificationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    thumbnail: String,
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ProductSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number
    },
    quantity: {
        type: Number
    },
    description: {
        type: String,
        required: true
    },
    thumbnail: String,
    images: [String],
    videos: [String],
    privateAttributes: [mongoose.Schema.Types.Mixed],
    classifications: [ClassificationSchema],
    approved: {
        type: Boolean,
        default: false,
    },
    bestseller: {
        type: Boolean,
        default: false,
    },
    latitude: Number,
    longitude: Number,
    chargeShipping: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    },
    shippingCharge: {
        type: Number,
        default: 0
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

export default mongoose.model('Product', ProductSchema);
