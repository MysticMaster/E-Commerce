import mongoose from "mongoose";

const ProductReviewSchema = new mongoose.Schema({
    buyerId: {type: String, required: true},
    productId: {type: String, required: true},
    imageKey: [String],
    videoKey: [String],
    reviewContent: {type: String, required: true},
    rating: {type: Number, required: true},
    feedback: String,
    status: {type: String, default: true},
    createdAt: {type: Date, default: Date.now},
});

export default mongoose.model("ProductReview", ProductReviewSchema);