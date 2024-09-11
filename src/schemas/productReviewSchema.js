import mongoose from "mongoose";

const ProductReviewSchema = new mongoose.Schema({
    buyerId: {type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true},
    productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
    images: [String],
    videos: [String],
    reviewContent: {type: String, required: true},
    rating: {type: Number, required: true},
    feedback: String,
    status: {type: String, default: true},
    createdAt: {type: Date, default: Date.now},
});

export default mongoose.model("ProductReview", ProductReviewSchema);
