import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
    buyerId: {type: String, required: true},
    productVariantId: {type: String, required: true},
    quantity: {type: String, required: true,default: 1},
    note:{type: String, default:""},
    createdAt: {type: Date, default: Date.now},
});

export default mongoose.model('Cart', CartSchema);

