import Product from "../../../schemas/productSchema.js";
import ProductReview from "../../../schemas/productReviewSchema.js";
import Buyer from "../../../schemas/buyerSchema.js";
import Order from "../../../schemas/orderSchema.js";
import {HTTPResponse} from "../../../services/HTTPResponse.js";
import {deleteMedia} from "../../../services/s3Function.js";
import {getThumbnail, getMediaData, uploadFiles, uploadThumbnail} from "../../../services/fileFunctions.js";

const maxAge = 86400;

const getProducts = async (req, res) => {
    try {
        const user = req.user;

        const products = await Product.find({vendorId: user.id})
            .populate('categoryId', 'name')
            .select('_id name thumbnail approved status ')
            .lean();

        const productsData = await Promise.all(products.map(async product => ({
            _id: product._id,
            categoryName: product.categoryId.name,
            name: product.name,
            approved: product.approved,
            status: product.status,
            thumbnail: await getThumbnail(product.thumbnail, maxAge, false)
        })));

        res.status(200).json(HTTPResponse(200, {products: productsData}, 'Successful'));

    } catch (error) {
        console.log(`getProducts ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .select('_id categoryId name price quantity description thumbnail images videos privateAttribute classifications approved latitude longitude chargeShipping shippingCharge status')
            .lean();

        if (!product) {
            return res.status(404).json(HTTPResponse(404, {}, 'Product Not Found'));
        }

        const productData = {
            id: product._id,
            categoryId: product.categoryId,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            description: product.description,
            thumbnail: await getThumbnail(product.thumbnail, maxAge, true),
            privateAttribute: product.privateAttribute,
            approved: product.approved,
            latitude: product.latitude,
            longitude: product.longitude,
            chargeShipping: product.chargeShipping,
            shippingCharge: product.shippingCharge,
            status: product.status,
            images: await getMediaData(product.images, maxAge, true),
            videos: await getMediaData(product.videos, maxAge, true)
        };

        if (product.classifications && product.classifications.length > 0) {
            productData.classifications = await Promise.all(
                product.classifications.map(async (item) => {
                    const {createdAt, ...rest} = item;
                    return {
                        ...rest,
                        thumbnail: await getThumbnail(item.thumbnail, maxAge, true)
                    };
                })
            );
        }

        const productReviews = await ProductReview.find({productId: product._id})
            .select('buyerId rating reviewContent feedback')
            .lean();

        if (productReviews.length > 0) {
            const buyerIds = productReviews.map(review => review.buyerId);
            const buyers = await Buyer.find({_id: {$in: buyerIds}})
                .select('name image')
                .lean();

            const buyerMap = buyers.reduce((map, buyer) => {
                map[buyer._id] = buyer;
                return map;
            }, {});

            productData.reviews = await Promise.all(
                productReviews.map(async (review) => ({
                    buyer: {
                        name: buyerMap[review.buyerId].name,
                        image: await getThumbnail(buyerMap[review.buyerId].image, maxAge, false)
                    },
                    review: review.rating,
                    reviewContent: review.reviewContent,
                    feedback: feedback
                }))
            );
        }

        res.status(200).json(HTTPResponse(200, {product: productData}, 'Successful'));
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

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const {
            categoryId,
            name,
            price,
            quantity,
            description,
            privateAttributes,
            classifications,
            latitude,
            longitude,
            chargeShipping,
            shippingCharge
        } = req.body;

        let thumbnail;
        if (req.files && req.files['productThumbnail']) {
            thumbnail = await uploadThumbnail(req.files['productThumbnail'][0]);
        }

        const classificationData = await Promise.all(
            classifications.map(async (classification) => {
                let thumbnail;
                if (req.files) {
                    const classificationThumbnails = req.files['classificationThumbnails'] || [];
                    thumbnail = classificationThumbnails.find(file => file.fieldname === classification.thumbnail);
                }

                return {
                    ...classification,
                    thumbnail: await uploadThumbnail(thumbnail)
                };
            })
        );

        await Product.create({
            categoryId: categoryId,
            vendorId: user.id,
            name: name,
            price: price,
            quantity: quantity,
            description: description,
            privateAttributes: privateAttributes,
            classifications: classificationData,
            latitude: latitude,
            longitude: longitude,
            chargeShipping: chargeShipping,
            shippingCharge: shippingCharge,
            thumbnail: thumbnail
        });

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));

    } catch (error) {
        console.log(`postProduct ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const patchProduct = async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const product = await Product.findById(req.params.id)
            .select('_id categoryId name price quantity description thumbnail images videos privateAttribute approved latitude longitude chargeShipping shippingCharge status');

        if (!product) {
            return res.status(404).json(HTTPResponse(404, {}, 'Product not found'));
        }

        const {
            name,
            price,
            quantity,
            description,
            privateAttributes,
            latitude,
            longitude,
            chargeShipping,
            shippingCharge
        } = req.body;

        if (name) product.name = name;
        if (price) product.price = price;
        if (quantity) product.quantity = quantity;
        if (privateAttributes) product.privateAttributes = privateAttributes;
        if (description) product.description = description;
        if (latitude) product.latitude = latitude;
        if (longitude) product.longitude = longitude;
        if (chargeShipping !== undefined) product.chargeShipping = chargeShipping;
        if (shippingCharge) product.shippingCharge = shippingCharge;

        await product.save();

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));

    } catch (error) {
        console.log(`patchProduct ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const patchProductInsertClassification = async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const product = await Product.findById(req.params.id)
            .select('_id classifications');

        if (!product) {
            return res.status(404).json(HTTPResponse(404, {}, 'Product not found'));
        }

        const {
            name,
            price,
            quantity
        } = req.body;

        if (name && product.classifications.some(cl => cl.name === name)) {
            return res.status(409).json(HTTPResponse(409, {}, 'Classification name already exists'));
        }

        let thumbnail;
        if (req.file) {
            thumbnail = await uploadThumbnail(req.file);
        }

        product.classifications.push({
            name: name,
            price: price,
            quantity: quantity,
            thumbnail: thumbnail
        });

        await product.save()

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));

    } catch (error) {
        console.log(`patchProduct ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

const patchProductUpdateThumbnail = async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        if (!req.file || !req.params.id) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const product = await Product.findById(req.params.id)
            .select('_id thumbnail');

        if (!product) {
            return res.status(404).json(HTTPResponse(404, {}, 'Product not found'));
        }

        if (req.file) {
            try {
                if (product.thumbnail) {
                    await deleteMedia(product.thumbnail)
                }
                product.thumbnail = await uploadThumbnail(req.file);

            } catch (error) {
                console.log("ERROR upload file: ", error);
            }
        }

        await product.save();

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));
    } catch (error) {
        console.error(`patchProductUpdateThumbnail ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

const patchProductInsertMedia = async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        if (!req.files || !req.params.id) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const product = await Product.findById(req.params.id)
            .select('_id images videos');

        if (!product) {
            return res.status(404).json(HTTPResponse(404, {}, 'Product not found'));
        }

        if (req.files && req.files.length > 0) {
            const {images, videos} = await uploadFiles(req.files);
            product.images.push(...images);
            product.videos.push(...videos);
        }

        await product.save();

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));

    } catch (error) {
        console.error(`patchProductInsertMedia ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const deleteProductDeleteMedia = async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        if (!req.params) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const {mediaId} = req.params;

        const extension = mediaId.split('.').pop().toLowerCase();

        await deleteMedia(mediaId);
        let updateResult;
        switch (extension) {
            case "jpg":
                updateResult = await Product.updateOne(
                    {_id: req.params.id},
                    {$pull: {images: mediaId}}
                );
                break;
            case "mp4":
                updateResult = await Product.updateOne(
                    {_id: req.params.id},
                    {$pull: {videos: mediaId}}
                );
                break;
            default:
                return res.status(400).json(HTTPResponse(400, {}, 'Media type not found'));
        }

        if (updateResult.matchedCount === 0) {
            return res.status(404).json(HTTPResponse(404, {}, 'Product not found'));
        }
        res.status(204).json(HTTPResponse(204, {}, 'Successful'));

    } catch (error) {
        console.error(`deleteProductDeleteMedia ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const patchProductChangeStatus = async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const product = await Product.findById(req.params.id)
            .select('_id');

        if (!product) {
            return res.status(404).json(HTTPResponse(404, {}, 'Product not found'));
        }

        const {status} = req.body;

        if (status === false) {
            const order = await Order.findOne({
                "orderItems.productId": product._id,
                "orderStatus": {$in: [0, 1, 2, 3]}
            }).select('_id').lean();
            if (order) {
                return res.status(409).json(HTTPResponse(409, {}, 'Product is currently in an active order and cannot be disable'));
            }
        }

        product.status = status;

        await product.save();

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));
    } catch (error) {
        console.error(`patchProductChangeStatus ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

const patchClassification = async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        if (!req.params) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const {productId, classificationId} = req.params;
        const {name, price, quantity, status} = req.body;

        const product = await Product.findById(productId)
            .select('_id classifications')
            .lean();

        if (!product) {
            return res.status(404).json(HTTPResponse(404, {}, 'Product not found'));
        }

        const classification = product.classifications.find(cl => cl._id.toString() === classificationId);
        if (!classification) {
            return res.status(404).json(HTTPResponse(404, {}, 'Classification not found'));
        }

        if (name && product.classifications.some(cl => cl.name === name && cl._id.toString() !== classificationId)) {
            return res.status(400).json(HTTPResponse(400, {}, 'Classification name already exists'));
        }

        if (name) classification.name = name;
        if (price) classification.price = price;
        if (quantity) classification.quantity = quantity;

        if (status === false) {
            const order = await Order.findOne({
                "orderItems.productId": product._id,
                "orderItems.classificationId": classificationId,
                "orderStatus": {$in: [0, 1, 2, 3]}
            }).select('_id').lean();

            if (order) {
                return res.status(409).json(HTTPResponse(409, {}, 'Classification is currently in an active order and cannot be disabled'));
            }

            classification.status = status;
        }

        await Product.findByIdAndUpdate(productId, {$set: {'classifications.$[elem]': classification}}, {
            arrayFilters: [{'elem._id': classificationId}],
            new: true
        });

        res.status(204).json(HTTPResponse(204, {}, 'Classification updated successfully'));
    } catch (error) {
        console.error(`patchClassification ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const patchClassificationUpdateThumbnail = async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        if (!req.file || !req.params) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const {productId, classificationId} = req.params;

        const product = await Product.findById(productId)
            .select('_id classifications');

        if (!product) {
            return res.status(404).json(HTTPResponse(404, {}, 'Product not found'));
        }

        const classification = product.classifications.find(cl => cl._id.toString() === classificationId);
        if (!classification) {
            return res.status(404).json(HTTPResponse(404, {}, 'Classification not found'));
        }

        if (req.file) {
            try {
                if (classification.thumbnail) {
                    await deleteMedia(classification.thumbnail);
                }

                classification.thumbnail = await uploadThumbnail(req.file);
            } catch (error) {
                console.log("ERROR upload file: ", error);
            }
        }

        await product.save();

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));
    } catch (error) {
        console.error(`patchProductUpdateThumbnail ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

export default {
    getProducts,
    getProductById,
    postProduct,
    patchProduct,
    patchProductUpdateThumbnail,
    patchProductInsertClassification,
    patchProductInsertMedia,
    deleteProductDeleteMedia,
    patchProductChangeStatus,
    patchClassification,
    patchClassificationUpdateThumbnail
}
