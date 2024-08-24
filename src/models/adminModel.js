import mongoose from 'mongoose';
import * as argon2 from "argon2";

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    role:{
        type: String,
        default: 'admin'
    }
});

adminSchema.pre('save', async function (next) {
    try {
        this.password = await argon2.hash(this.password);
        next();
    } catch (error) {
        next(error);
    }
});

adminSchema.statics.login = async function (username, password) {
    const member = await this.findOne({ username: username });
    if (!member) {
        throw Error('u');
    }

    const isPasswordValid = await argon2.verify(member.password, password);
    if (!isPasswordValid) {
        throw Error('p');
    }
    return member;
};

export default mongoose.model('Admin', adminSchema);