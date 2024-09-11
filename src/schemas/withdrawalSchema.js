import mongoose from 'mongoose';

const WithdrawalSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    bankName: {
        type: String,
        required: true,
    },
    bankAccountNumber: {
        type: Number,
        required: true,
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

export default mongoose.model('Withdrawal', WithdrawalSchema);
