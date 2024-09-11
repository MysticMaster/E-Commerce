import Cart from "../../../schemas/cartSchema.js";
import Vendor from "../../../schemas/vendorSchema.js";
import dotenv from "dotenv";
import {HTTPResponse} from "../../../services/HTTPResponse.js";
import {getMedia} from "../../../services/s3Function.js";

dotenv.config();

const maxAge = 86400;

const getCarts = async (req, res) => {
    try {
        const user = req.user;

        const carts = await Cart.find({buyerId: user.id})
            .populate({
                path: 'productVariantId',
                select: '_id variantName price quantity imageKey'
            })
            .populate({
                path: 'vendorId',
                select: '_id vendorName'
            });

        const cartsData = [];

        for (const cart of carts) {


            const vendorData = {
                id: vendor._id,
                vendorName: vendor.vendorName
            };

            cartsData.push(cartData);
        }

        res.status(200).json(HTTPResponse(200, {carts: cartsData}, 'Successful'));
    } catch (error) {
        console.log(`getCarts ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const postCart = async (req, res) => {
    try {
        const user = req.user;

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const {vendorId, productVariantId, quantity, note} = req.body;

        const vendor = await Vendor.findOne({_id: vendorId});

        if (!vendor) {
            return res.status(404).json(HTTPResponse(404, {}, 'Vendor not found'));
        }

        await Cart.create({
            buyerId: user.id,
            vendorId: vendorId,
            productVariantId: productVariantId,
            quantity: quantity,
            note: note
        });

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));
    } catch (error) {
        console.log(`postCart ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

const patchCart = async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const {vendorId, productVariantId, quantity, note} = req.body;

        const cart = await Cart.findOne({_id: req.params.id});

        if (!cart) {
            return res.status(404).json(HTTPResponse(404, {}, 'Cart not found'));
        }

        if (vendorId && vendorId !== ""){
            const vendor = await Vendor.findOne({_id: vendorId});

            if (!vendor) {
                return res.status(404).json(HTTPResponse(404, {}, 'Vendor not found'));
            }

            cart.vendorId = vendorId;
        }

        if (note || note !== null) cart.note = note;

        await cart.save();

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));
    } catch (error) {
        console.log(`patchCart ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

const patchCartPlus = async (req, res) => {
    try {
        const cart = await Cart.findOne({_id: req.params.id})
            .populate({
                path: 'productVariantId',
                select: 'quantity'
            });

        if (!cart) {
            return res.status(404).json(HTTPResponse(404, {}, 'Cart not found'));
        }

        const variant = cart.productVariantId;

        if (cart.quantity < variant.quantity) {
            cart.quantity += 1;
            await cart.save();
            res.status(204).json(HTTPResponse(204, {}, 'Successful'));
        } else {
            return res.status(400).json(HTTPResponse(400, {}, 'Quantity exceeds available stock'));
        }
    } catch (error) {
        console.log(`patchCartPlus ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const patchCartMinus = async (req, res) => {
    try {
        const cart = await Cart.findOne({_id: req.params.id});

        if (!cart) {
            return res.status(404).json(HTTPResponse(404, {}, 'Cart not found'));
        }

        if (cart.quantity > 1) {
            cart.quantity -= 1;
            await cart.save();
        } else {
            await Cart.deleteOne({_id: cart._id});
            return res.status(204).json(HTTPResponse(204, {}, 'Cart item removed'));
        }

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));
    } catch (error) {
        console.log(`patchCartMinus ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const deleteCart = async (req, res) => {
    try {
        await Cart.deleteOne({_id: req.params.id});
        res.status(204).json(HTTPResponse(204, {}, 'Successful'));
    } catch (error) {
        console.log(`deleteCart ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

export default {
    getCarts,
    postCart,
    patchCart,
    patchCartPlus,
    patchCartMinus,
    deleteCart
}
