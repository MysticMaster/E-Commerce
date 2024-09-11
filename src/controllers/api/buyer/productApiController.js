import Product from "../../../schemas/productSchema.js";
import Category from "../../../schemas/categorySchema.js";
import Buyer from "../../../schemas/buyerSchema.js";
import ProductReview from "../../../schemas/productReviewSchema.js";
import dotenv from "dotenv";
import {HTTPResponse} from "../../../services/HTTPResponse.js";
import {getMedia} from "../../../services/s3Function.js";
import Vendor from "../../../schemas/vendorSchema.js";

dotenv.config();

const maxAge = 86400;

const getProducts = async (req, res) => {
    const sizePage = +req.query.size || 15;
    const currentPage = +req.query.page || 1;
    const searchQuery = req.query.search || '';
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const categoryId = req.query.categoryId || null;
    const chargeShipping = req.query.chargeShipping || null;
    //const privateAttribute = req.query.privateAttribute || null;

    try {
        let filterConditions = {
            approved: true,
            status: true,
            productName: {$regex: searchQuery, $options: 'i'},
        };

        if (categoryId) filterConditions.categoryId = categoryId;
        if (chargeShipping !== null) filterConditions.chargeShipping = chargeShipping;
        //if (privateAttribute !== null) filterConditions.privateAttribute = privateAttribute;

        const totalProducts = await Product.countDocuments(filterConditions);
        const totalPages = Math.ceil(totalProducts / sizePage);
        const products = await Product.find(filterConditions)
            .sort({[sortField]: sortOrder})
            .skip((currentPage - 1) * sizePage)
            .limit(sizePage);

        const productsData = [];

        if (sortField === 'minPrice' || sortField === 'maxPrice') {
            productsData.sort((a, b) => sortOrder * (a[sortField] - b[sortField]));
        }

        res.status(200).json(HTTPResponse(200, {
            products: productsData,
            currentPage: currentPage,
            totalPages: totalPages,
        }, 'Successful'));

    } catch (error) {
        console.log(`getProducts ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};


const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id, approved: true, status: true
        });

        if (!product) {
            return res.status(404).json(HTTPResponse(404, {}, 'Product Not Found'));
        }

        const vendor = await Vendor.findOne({_id: product.vendorId});
        const vendorData = {
            id: vendor._id,
            vendorName: vendor.vendorName,
            businessName: vendor.businessName
        }

        const productData = {
            id: product._id,
            vendorData: vendorData,
            productName: product.productName,
            bestseller: product.bestseller,
            countryValue: product.countryValue,
            description: product.description,
            privateAttribute: product.privateAttribute,
            latitude: product.latitude,
            longitude: product.longitude,
            chargeShipping: product.chargeShipping,
            shippingCharge: product.shippingCharge
        };

        const category = await Category.findOne({_id: product.categoryId});
        productData.categoryName = category ? category.categoryName : null;



        if (product.imageKey && product.imageKey.length > 0) {
            productData.imageData = await Promise.all(product.imageKey.map(async (imageKey) => {
                const imageUrl = await getMedia(imageKey, maxAge);
                return {imageUrl: imageUrl};
            }));
        }

        if (product.videoKey && product.videoKey.length > 0) {
            productData.videoData = await Promise.all(product.videoKey.map(async (videoKey) => {
                const videoUrl = await getMedia(videoKey, maxAge);
                return {videoUrl: videoUrl};
            }));
        }

        const productReviews = await ProductReview.find({productId: product._id}).limit(10);
        const productReviewsData = [];
        for (const review of productReviews) {
            const buyer = await Buyer.findOne({_id: buyerId});

            let imageUrl = "";
            if (buyer.imageKey) imageUrl = await getMedia(buyer.imageKey, maxAge);

            const reviewData = {
                buyer: {fullName: buyer.fullName, imageData: {imageUrl: imageUrl}},
                rating: review.rating,
                reviewContent: review.reviewContent
            }
            productReviewsData.push(reviewData);
        }

        productData.reviews = productReviewsData;

        res.status(200).json(HTTPResponse(200, {product: productData}, 'Successful'))
    } catch (error) {
        console.log(`getProductById ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

export default {
    getProducts,
    getProductById
}
