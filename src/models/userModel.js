import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: String,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

UserSchema.index({userId: 1});

export default mongoose.model('User', UserSchema);
