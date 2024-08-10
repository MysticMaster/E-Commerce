import mongoose from 'mongoose';

const PrivateAttributeSchema = new mongoose.Schema({
    key: {type: String, required: true},
    value: {type: mongoose.Schema.Types.Mixed, required: true}
});

export default PrivateAttributeSchema;
