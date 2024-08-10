import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
    vendorName: {type: String, required: true},
    businessName: {type: String, required: true},
    cityValue: {type: String, required: true},
    countryValue: {type: String, required: true},
    email: {type: String, required: true},
    phoneNumber: {type: String, required: true},
    taxCode: {type: String, required: true},
    imageKey: String,
    imageUrl: String,
    approved: {type: Boolean, default: false},
    status: {type: Boolean, default: true},
});

export default mongoose.model('Vendor', VendorSchema);