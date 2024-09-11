import mongoose from 'mongoose'

const productGroupSchema = new mongoose.Schema({
    vendorId: {type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true},
    thumbnail: String,
    name:{
        type: String,
        required: true
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('ProductGroup', productGroupSchema);
