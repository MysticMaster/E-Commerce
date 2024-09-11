import Order from "../../../schemas/orderSchema.js";
import Vendor from "../../../schemas/vendorSchema.js";
import dotenv from "dotenv";
import {HTTPResponse} from "../../../services/HTTPResponse.js";
import {getMedia} from "../../../services/s3Function.js";
import generateRandomString from "../../../services/generateRandomString.js";
import User from "../../../schemas/userSchema.js";
import {sendDataMessage, sendNotification} from "../../../config/firebase.js";

dotenv.config();
const maxAge = 86400;

const getOrders = async (req, res) => {
    try {
        const user = req.user;
        const orderStatus = req.query.orderStatus !== undefined ? +req.query.orderStatus : 0;

        const orders = await Order.find({
            buyerId: user.id,
            orderStatus: orderStatus
        })
            .populate({
                path: 'orderItem.productVariantId',
                select: 'variantName privateAttribute imageKey'
            })
            .lean();

        const ordersData = await Promise.all(orders.map(async (order) => {
            const orderItemsData = await Promise.all(order.orderItem.map(async (item) => {

            }));

            return {
                id: order.orderId,
                totalPrice: order.totalPrice,
                totalQuantity: order.totalQuantity,
                orderStatus: order.orderStatus,
                orderItems: orderItemsData,
            };
        }));

        res.status(200).json(HTTPResponse(200, {orders: ordersData}, 'Successful'));
    } catch (error) {
        console.log(`getOrders ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({orderId: req.params.id})
            .populate({
                path: 'orderItem.productVariantId',
                select: 'variantName privateAttribute imageKey',
            })
            .populate({
                path: 'vendorId',
                select: 'vendorName imageKey'
            })
            .lean();

        if (!order) {
            return res.status(404).json(HTTPResponse(404, {}, 'Order Not Found'));
        }

        const orderItemsData = await Promise.all(order.orderItem.map(async (item) => {

            return {
                productVariant: variantData,
                price: item.price,
                quantity: item.quantity,
                note: item.note,
            };
        }));

        const vendor = order.vendorId;
        const vendorData = {
            id: vendor._id,
            vendorName: vendor.vendorName
        };

        if (vendor.imageKey) {
            const imageUrl = await getMedia(vendor.imageKey[0], maxAge);
            vendorData.imageData = {imageUrl};
        }

        const orderData = {
            id: order.orderId,
            vendorData: vendorData,
            shippingAddress: order.shippingAddress,
            deliveryPhoneNumber: order.deliveryPhoneNumber,
            deliveryEmail: order.deliveryEmail,
            discount: order.discount,
            totalPrice: order.totalPrice,
            totalQuantity: order.totalQuantity,
            note: order.note,
            orderItems: orderItemsData,
            orderStatus: order.orderStatus,
            orderPlacedAt: order.orderPlacedAt,
            orderConfirmedAt: order.orderConfirmedAt,
            orderShippedAt: order.orderShippedAt,
            orderDeliveredAt: order.orderDeliveredAt,
            orderReceivedAt: order.orderReceivedAt,
            orderCancelledAt: order.orderCancelledAt,
            orderRefusedAt: order.orderRefusedAt,
        };

        res.status(200).json(HTTPResponse(200, {order: orderData}, 'Successful'));
    } catch (error) {
        console.log(`getOrderById ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const postOrder = async (req, res) => {
    try {
        const buyer = req.user;

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const {
            orderId,
            vendorId,
            recipientName,
            shippingAddress,
            deliveryPhoneNumber,
            deliveryEmail,
            discount,
            totalPrice,
            totalQuantity,
            note,
            orderItem,
        } = req.body;

        if (!orderItem || orderItem.length === 0) {
            return res.status(400).json(HTTPResponse(400, {}, 'Order items cannot be empty'));
        }

        const newOrder = new Order({
            orderId,
            buyerId: buyer.id,
            vendorId,
            recipientName,
            shippingAddress,
            deliveryPhoneNumber,
            deliveryEmail,
            discount,
            totalPrice,
            totalQuantity,
            note,
            orderItem
        });

        await newOrder.save();

        const [vendor, user] = await Promise.all([
            Vendor.findById(vendorId),
            Vendor.findOne({_id: vendorId}).populate('userId') // Đảm bảo userId là trường liên kết trong Vendor Schema
        ]);

        if (!vendor) {
            return res.status(404).json(HTTPResponse(404, {}, 'Vendor Not Found'));
        }

        if (!user) {
            return res.status(404).json(HTTPResponse(404, {}, 'User Not Found'));
        }

        if (user.fcmToken) {
            await Promise.all([
                sendNotification(user.fcmToken, 'New Order Received', 'A new order has been placed.'),
                sendDataMessage(user.fcmToken, {action: "order_reload", orderId: newOrder.orderId}),
                sendDataMessage(user.fcmToken, {action: "notification_reload"}),
                Notification.create({
                    receiverId: vendor._id,
                    orderId: newOrder.orderId,
                    title: 'New Order Received',
                    content: 'A new order has been placed.'
                })
            ]).catch(notificationError => {
                console.log(`Failed to send notification or data message: ${notificationError.message}`);
            });
        }

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));
    } catch (error) {
        console.log(`postOrder ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const patchReceiveOrder = async (req, res) => {
    try {
        const {id} = req.params;

        const order = await Order.findOne({orderId: id});
        if (!order) return res.status(404).json(HTTPResponse(404, {}, 'Order Not Found'));

        if (order.orderStatus === 4) {
            return res.status(400).json(HTTPResponse(400, {}, 'Order already received'));
        }

        order.orderStatus = 4;
        order.orderReceivedAt = Date.now();
        await order.save();

        const vendor = await Vendor.findById(order.vendorId);
        if (vendor) {
            const user = await User.findOne({userId: vendor.userId});
            if (user && user.fcmToken) {
                try {
                    await Promise.all([
                        sendNotification(user.fcmToken, 'Order Received', 'Your order has been received and is being processed.'),
                        sendDataMessage(user.fcmToken, {action: "order_reload", orderId: order.orderId}),
                        sendDataMessage(user.fcmToken, {action: "notification_reload"}),
                        Notification.create({
                            receiverId: vendor._id,
                            orderId: order.orderId,
                            title: 'Order Received',
                            content: 'Your order has been received and is being processed.'
                        })
                    ]);
                } catch (notificationError) {
                    console.log(`Failed to send notification or data message: ${notificationError.message}`);
                }
            }
        }

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));
    } catch (error) {
        console.log(`patchReceiveOrder ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};


const patchCancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({orderId: req.params.id});

        if (!order) return res.status(404).json(HTTPResponse(404, {}, 'Order Not Found'));

        order.orderStatus = 5;
        order.orderCancelledAt = Date.now();
        await order.save();

        const vendor = await Vendor.findById(order.vendorId);
        if (vendor) {
            const user = await User.findOne({userId: vendor.userId});
            if (user && user.fcmToken) {
                try {
                    await Promise.all([
                        sendNotification(user.fcmToken, 'Order Cancelled', 'A order has been cancelled.'),
                        sendDataMessage(user.fcmToken, {action: "order_reload", orderId: order.orderId}),
                        sendDataMessage(user.fcmToken, {action: "notification_reload"}),
                        Notification.create({
                            receiverId: vendor._id,
                            orderId: order.orderId,
                            title: 'Order Cancelled',
                            content: 'A order has been cancelled.'
                        })
                    ]);
                } catch (notificationError) {
                    console.log(`Failed to send notification or data message: ${notificationError.message}`);
                }
            }
        }

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));
    } catch (error) {
        console.log(`patchCancelOrder ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const deleteOrder = async (req, res) => {
    try {
        await Order.updateOne({orderId: req.params.id}, {
            status: false
        });
        res.status(204).json(HTTPResponse(204, {}, 'Successful'));
    } catch (error) {
        console.log(`deleteOrder ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

export default {
    getOrders,
    getOrderById,
    postOrder,
    patchReceiveOrder,
    patchCancelOrder,
    deleteOrder
}



