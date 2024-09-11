import ProductGroup from "../../../schemas/productGroupSchema.js";
import {getThumbnail, uploadThumbnail} from "../../../services/fileFunctions.js";
import {HTTPResponse} from "../../../services/HTTPResponse.js";
import {deleteMedia} from "../../../services/s3Function.js";

const maxAge = 86400;

const getProductGroups = async (req, res) => {
    try {
        const user = req.user;

        const productGroups = await ProductGroup.find({vendorId: user.id})
            .select('_id thumbnail products')
            .lean();

        const productGroupsData = await Promise.all(productGroups.map(async group => ({
            _id: group._id,
            name:group.name,
            thumbnail: await getThumbnail(group.thumbnail, maxAge, false),
            products: group.products.length
        })));

        res.status(200).json(HTTPResponse(200, {products: productGroupsData}, 'Successful'));

    } catch (error) {
        console.log(`getProductGroups ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

const getProductGroup = async (req, res) => {
    try {
        const productGroup = await ProductGroup.findById(req.params.id)
            .populate('products', 'name thumbnail')
            .select('_id thumbnail products')
            .lean();

        if (!productGroup) {
            return res.status(404).json(HTTPResponse(404, {}, 'ProductGroup not found'));
        }

        const groupData = {
            _id: productGroup._id,
            name:productGroup.name,
            thumbnail: await getThumbnail(productGroup.thumbnail, maxAge, false),
            products: await Promise.all(productGroup.products.map(async product => ({
                _id: product._id,
                name: product.name,
                thumbnail: await getThumbnail(product.thumbnail, maxAge, false)
            })))
        };

        res.status(200).json(HTTPResponse(200, {productGroup: groupData}, 'Successful'));

    } catch (error) {
        console.log(`getProductGroup ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

const postProductGroup = async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        if (Object.keys(req.body).length === 0 || !req.body.products || req.body.products.length === 0) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const {
            name,
            products,
        } = req.body;

        let thumbnail;
        if (req.file) {
            thumbnail = await uploadThumbnail(req.file);
        }

        await ProductGroup.create({
            vendorId: user.id,
            name:name,
            products: products,
            thumbnail: thumbnail
        })

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));

    } catch (error) {
        console.log(`postProductGroup ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

const patchProductGroup= async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        if (Object.keys(req.body).length === 0 || !req.body.products || req.body.products.length === 0) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const productGroup = await ProductGroup.findById(req.params.id)
            .select('_id name');

        if (!productGroup) {
            return res.status(404).json(HTTPResponse(404, {}, 'ProductGroup not found'));
        }

        if (productGroup.products.includes(req.body.productId)) {
            return res.status(400).json(HTTPResponse(400, {}, 'Product already exists in the group'));
        }

        productGroup.name = req.body.name;

        await productGroup.save();

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));

    } catch (error) {
        console.log(`patchProductGroup ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

const patchProductGroupInsertProduct = async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        if (Object.keys(req.body).length === 0 || !req.body.products || req.body.products.length === 0) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const productGroup = await ProductGroup.findById(req.params.id)
            .select('_id products');

        if (!productGroup) {
            return res.status(404).json(HTTPResponse(404, {}, 'ProductGroup not found'));
        }

        if (productGroup.products.includes(req.body.productId)) {
            return res.status(400).json(HTTPResponse(400, {}, 'Product already exists in the group'));
        }

        productGroup.products.push(req.body.productId);

        await productGroup.save();

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));

    } catch (error) {
        console.log(`patchProductGroupInsertProduct ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

const deleteProductGroupDeleteProduct = async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        const {productId} = req.params;

        const productGroup = await ProductGroup.findById(req.params.id)
            .select('_id products');

        if (!productGroup) {
            return res.status(404).json(HTTPResponse(404, {}, 'ProductGroup not found'));
        }

        const productIndex = productGroup.products.indexOf(productId);
        if (productIndex === -1) {
            return res.status(404).json(HTTPResponse(404, {}, 'Product not found in ProductGroup'));
        }

        productGroup.products.splice(productIndex, 1);

        await productGroup.save();

        res.status(204).json(HTTPResponse(204, {}, 'Successfully'));

    } catch (error) {
        console.log(`deleteProductGroupDeleteProduct ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

const patchProductGroupUpdateThumbnail = async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        if (!req.file || !req.params.id) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const productGroup = await ProductGroup.findById(req.params.id)
            .select('_id thumbnail');

        if (!productGroup) {
            return res.status(404).json(HTTPResponse(404, {}, 'ProductGroup not found'));
        }

        if (req.file) {
            try {
                if (productGroup.thumbnail) {
                    await deleteMedia(productGroup.thumbnail)
                }
                productGroup.thumbnail = await uploadThumbnail(req.file);

            } catch (error) {
                console.log("ERROR upload file: ", error);
            }
        }

        await productGroup.save();

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));
    } catch (error) {
        console.error(`patchProductGroupUpdateThumbnail ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

const deleteProductGroup = async (req, res) => {
    try {
        const user = req.user;

        if (!user.approved) {
            return res.status(403).json(HTTPResponse(403, {}, 'Account is not approved'));
        }

        if (!req.params.id) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const productGroup = await ProductGroup.findById(req.params.id)
            .select('_id thumbnail').lean();

        if (!productGroup) {
            return res.status(404).json(HTTPResponse(404, {}, 'ProductGroup not found'));
        }

        await ProductGroup.deleteOne({_id: productGroup._id});

        if (productGroup.thumbnail) {
            await deleteMedia(productGroup.thumbnail);
        }

        res.status(204).json(HTTPResponse(204, {}, 'ProductGroup deleted successfully'));
    } catch (error) {
        console.error(`deleteProductGroup ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

export default {
    getProductGroups,
    getProductGroup,
    postProductGroup,
    patchProductGroupInsertProduct,
    deleteProductGroupDeleteProduct,
    patchProductGroupUpdateThumbnail,
    deleteProductGroup
}
