import mongoose from "mongoose";
import PrivateAttributeSchema from "./privateAttributeModel.js";

const ProductVariantSchema = new mongoose.Schema({
    productId:{
        type: String,
        required: true,
    },
    variantName:{
        type: String,
        required: true,
    },
    imageKey:[String],
    imageUrl:[String],
    price:{
        type: Number,
        required: true,
        default:0
    },
    quantity:{
        type: Number,
        required: true,
        default:0
    },
    privateAttribute:{
        type: [PrivateAttributeSchema],
        required: true,
        default: []
    },
    status:{
        type: Boolean,
        default: true
    }
});

export default mongoose.model("ProductVariant", ProductVariantSchema);