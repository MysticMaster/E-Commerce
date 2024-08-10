import mongoose from "mongoose";

const ProductReviewSchema = new mongoose.Schema({
    buyerId: {type: String, required: true},
    reviewImageKey: [String],
    reviewImageUrl: [String],
    reviewContent: {type: String, required: true},
    rating: {type: Number, required: true},
    feedback: {type: String, default: ''},
    createdAt: {type: Date, default: Date.now},
});

export default mongoose.model("ProductReview", ProductReviewSchema);