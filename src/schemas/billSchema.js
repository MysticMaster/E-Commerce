import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema({
    orderId: {type: String, required: true},
    amount: {type: Number, required: true},
    createdAt: {type: Date, default: Date.now}
});

export default mongoose.model('Bill', BillSchema);
