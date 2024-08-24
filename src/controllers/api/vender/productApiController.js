import Product from "../../../models/productModel.js";
import dotenv from "dotenv";
import {HTTPResponse} from "../../../services/HTTPResponse.js";
import {uploadMedia, getMedia, deleteMedia} from "../../../services/s3Function.js";
import sharp from "sharp";

dotenv.config();
const maxAge = 86400;

const getProductsByVendorId = async (req, res) => {
    try {
        const user = req.user;

        const products = await Product.find({vendorId: user.id});

        const productsData = [];

        for (const product of products) {
            const {imageKey, videoKey, ...productData} = product.toObject();

            if (imageKey && imageKey.length > 0) {
                productData.imageData = await Promise.all(imageKey.map(async (imageKey) => {
                    const imageUrl = await getMedia(imageKey, maxAge);
                    return {imageKey: imageKey, imageUrl: imageUrl};
                }));
            }

            if (videoKey && videoKey.length > 0) {
                productData.videoData = await Promise.all(videoKey.map(async (videoKey) => {
                    const videoUrl = await getMedia(videoKey, maxAge);
                    return {videoKey: videoKey, videoUrl: videoUrl};
                }));
            }

            productsData.push(productData);
        }

        res.status(200).json(HTTPResponse(200, {products: productsData}, 'Successful'));

    } catch (error) {
        console.log(`getProductsByVendorId ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};


const getProductById = async (req, res) => {
    try {
        const user = req.user;

        const product = await Product.findOne({
            _id: req.params.id,
            vendorId: user.id
        });

        if (!product) {
            return res.status(404).json(HTTPResponse(404, {}, 'Product Not Found'));
        }

        const {imageKey, videoKey, ...productData} = product.toObject();

        if (imageKey && imageKey.length > 0) {
            productData.imageData = await Promise.all(imageKey.map(async (imageKey) => {
                const imageUrl = await getMedia(imageKey, maxAge);
                return {imageKey: imageKey, imageUrl: imageUrl};
            }));
        }

        if (videoKey && videoKey.length > 0) {
            productData.videoData = await Promise.all(videoKey.map(async (videoKey) => {
                const videoUrl = await getMedia(videoKey, maxAge);
                return {videoKey: videoKey, videoUrl: videoUrl};
            }));
        }

        res.status(200).json(HTTPResponse(200, {product: productData}, 'Successful'))
    } catch (error) {
        console.log(`getProductById ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const postProduct = async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        if (!req.body) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const {
            categoryId,
            productName,
            countryValue,
            description,
            privateAttribute,
            latitude,
            longitude,
            chargeShipping,
            shippingCharge
        } = req.body;

        // if (![0, 1, 2].includes(chargeShipping)) {
        //     return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        // }

        const imageKeys = [];
        const videoKeys = [];

        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file) => {
                const mimeType = file.mimetype;

                if (mimeType.startsWith('image/')) {
                    return (async () => {
                        try {
                            const buffer = await sharp(file.buffer)
                                .resize({height: 650, width: 650, fit: "cover"})
                                .toBuffer();
                            const fileName = await uploadMedia(file, buffer)
                            imageKeys.push(fileName);
                        } catch (error) {
                            console.log("ERROR upload image: ", error);
                        }
                    })();
                } else if (mimeType.startsWith('video/')) {
                    return (async () => {
                        try {
                            const fileName = await uploadMedia(file, file.buffer)
                            videoKeys.push(fileName);
                        } catch (error) {
                            console.log("ERROR upload video: ", error.message);
                        }
                    })();
                }
            });

            await Promise.all(uploadPromises);
        }

        const newProduct = new Product({
            categoryId,
            productName,
            vendorId: user.id,
            countryValue,
            description,
            privateAttribute,
            latitude,
            longitude,
            chargeShipping,
            shippingCharge,
            imageKey: imageKeys,
            videoKey: videoKeys,
        });

        const product = await newProduct.save();
        //console.log(`Product: ${JSON.stringify(product)}`);

        res.status(201).json(HTTPResponse(201, {}, 'Successful'));

    } catch (error) {
        console.log(`postProduct ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const putProductInsertMedia = async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        if (!req.file || !req.params.id) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const product = await Product.findOne({_id: req.params.id});

        if (!product) {
            return res.status(404).json(HTTPResponse(404, {}, 'Product not found'));
        }

        const mimeType = req.file.mimetype;

        if (mimeType.startsWith('image/')) {
            try {
                const buffer = await sharp(req.file.buffer)
                    .resize({height: 650, width: 650, fit: "cover"})
                    .toBuffer();
                const fileName = await uploadMedia(req.file, buffer);
                product.imageKey.push(fileName);
            } catch (error) {
                console.log("ERROR upload image: ", error);
                return res.status(500).json(HTTPResponse(500, {}, 'Error uploading image'));
            }
        } else if (mimeType.startsWith('video/')) {
            try {
                const fileName = await uploadMedia(req.file, req.file.buffer);
                product.videoKey.push(fileName);
            } catch (error) {
                console.log("ERROR upload video: ", error.message);
                return res.status(500).json(HTTPResponse(500, {}, 'Error uploading video'));
            }
        }

        await product.save();

        res.status(200).json(HTTPResponse(200, {}, 'Successful'));

    } catch (error) {
        console.error(`putProductInsertMedia ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};


const putProductDeleteMedia = async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        if (!req.body || !req.params.id) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const {media} = req.body;

        const extension = media.split('.').pop().toLowerCase();

        let updateResult;
        switch (extension) {
            case "jpg":
                updateResult = await Product.updateOne(
                    {_id: req.params.id},
                    {$pull: {imageKey: media}}
                );
                break;
            case "mp4":
                updateResult = await Product.updateOne(
                    {_id: req.params.id},
                    {$pull: {videoKey: media}}
                );
                break;
            default:
                return res.status(400).json(HTTPResponse(400, {}, 'Media type not found'));
        }

        if (updateResult.matchedCount === 0) {
            return res.status(404).json(HTTPResponse(404, {}, 'Product not found'));
        }
        await deleteMedia(media);
        res.status(200).json(HTTPResponse(200, {}, 'Successful'));

    } catch (error) {
        console.error(`putProductDeleteMedia ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};


export default {getProductsByVendorId, getProductById, postProduct, putProductInsertMedia, putProductDeleteMedia}
