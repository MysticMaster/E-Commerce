import mongoose from 'mongoose';

const WithdrawalSchema = new mongoose.Schema({
    vendorId:{

    },
    amount:{
        type:String,
        required:true,
    },
    bankName:{
        type: String,
        required:true,
    },

    bankAccountNumber:{
        type: Number,
        required:true,
    },

})