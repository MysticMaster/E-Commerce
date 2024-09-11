import mongoose from 'mongoose'

const WalletSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId, ref:'User',required:true},
    balance:{type:Number,required:true},
    currency:{type:String,required:true},
    status:{type:String,required:true},
    createdAt:{type:Date,default:Date.now},
});

export default mongoose.model('Wallet', WalletSchema);
