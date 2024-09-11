import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {type: String, required: true},
    businessName: {type: String, default:'Your Business Name'},
    cityValue: {type: String, required: true, default:'Your City'},
    countryValue: {type: String, required: true, default:'Your Country'},
    telephone: {type: String, required: true, default:'Your Telephone'},
    taxCode: {type: String, required: true, default:'Your Tax Code'},
    image: String,
    approved: {type: Boolean, default: false},
    role:{
        type: String,
        default: 'vendor',
    },
    status: {type: Boolean, default: true},
    createdAt: {type: Date, default: Date.now}
});

export default mongoose.model('Vendor', VendorSchema);
