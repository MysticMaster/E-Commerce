import mongoose from 'mongoose';
import PrivateAttributeSchema  from "./privateAttributeModel.js";

const ProductSchema = new mongoose.Schema({
    categoryId: {
        type: String,
        required: true,
    },
    productName: {
        type: String,
        required: true
    },
    vendorId: {
        type: String,
        required: true,
    },
    imageKey: [String],
    imageUrl: [String],
    approved: {
        type: Boolean,
        default: false,
    },
    bestseller: {
        type: Boolean,
        default: false,
    },
    countryValue: String,
    description: String,
    privateAttribute: {
        type: [PrivateAttributeSchema],
        default: []
    },
    latitude: Number,
    longitude: Number,
    chargeShipping: {
        type: Number,
        enum: [0, 1, 2],
        required: true,
        default: 0
    },
    shippingCharge: {
        type: Number,
        default: 0
    },
    status: {
        type: Boolean,
        default: true,
    }
});

export default mongoose.model('Product', ProductSchema);
