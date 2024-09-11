import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
    buyerId: {type: String, required: true},
    vendorId: {type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true},
    productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
    classificationId: String,
    quantity: {type: Number, default: 1},
    note: {type: String, default: ""},
    createdAt: {type: Date, default: Date.now},
});

export default mongoose.model('Cart', CartSchema);
