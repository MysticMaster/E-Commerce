import Order from "../../../schemas/orderSchema.js";
import Buyer from "../../../schemas/buyerSchema.js";
import dotenv from "dotenv";
import {HTTPResponse} from "../../../services/HTTPResponse.js";
import {getMedia} from "../../../services/s3Function.js";
import User from "../../../schemas/userSchema.js";
import {sendDataMessage, sendNotification} from "../../../config/firebase.js";

dotenv.config();
const maxAge = 86400;

const getOrders = async (req, res) => {
    try {
        const user = req.user;

        const orderStatus = req.query.orderStatus !== undefined ? +req.query.orderStatus : 0;

        const orders = await Order.find({
            vendorId: user.id,
            orderStatus: orderStatus
        });



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
        const order = await Order.findOne({orderId: req.params.id});
        if (!order) {
            return res.status(404).json(HTTPResponse(404, {}, 'Order Not Found'));
        }

        const orderItemsData = await Promise.all(order.orderItem.map(async (item) => {

        }));

        const buyer = await Buyer.findOne({_id: order.buyerId});
        const buyerData = {
            id: buyer._id,
            buyerName: buyer.fullName,
        }
        if (buyer.imageKey) {
            const imageUrl = await getMedia(buyer.imageKey[0], maxAge);
            buyerData.imageData = {imageUrl: imageUrl}
        }

        const orderData = {
            id: order.orderId,
            buyerData: buyerData,
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
        }
        res.status(200).json(HTTPResponse(200, {order: orderData}, 'Successful'));
    } catch (error) {
        console.log(`getOrderById ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

const patchConfirmOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.id });

        if (!order) return res.status(404).json(HTTPResponse(404, {}, 'Order Not Found'));

        order.orderStatus = 1;
        order.orderConfirmedAt = Date.now();

        await order.save();

        const buyer = await Buyer.findOne({ _id: order.buyerId });
        const user = await User.findOne({ userId: buyer.userId });

        if (user && user.fcmToken) {
            try {
                await sendNotification(user.fcmToken, 'Order Confirmed', 'Your order has been confirmed.');

                await sendDataMessage(user.fcmToken, {
                    action: "order_reload",
                    orderId: order.orderId
                });

                await sendDataMessage(user.fcmToken, {
                    action: "notification_reload"
                });

                await Notification.create({
                    receiverId: buyer._id,
                    orderId: order.orderId,
                    title: 'Order Confirmed',
                    content: 'Your order has been confirmed.'
                });
            } catch (notificationError) {
                console.log(`Failed to send notification or data message: ${notificationError.message}`);
            }
        }

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));
    } catch (error) {
        console.log(`patchConfirmOrder ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const patchShipOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.id });

        if (!order) return res.status(404).json(HTTPResponse(404, {}, 'Order Not Found'));

        order.orderStatus = 2;
        order.orderShippedAt = Date.now();

        await order.save();

        const buyer = await Buyer.findOne({ _id: order.buyerId });
        const user = await User.findOne({ userId: buyer.userId });

        if (user && user.fcmToken) {
            try {
                await sendNotification(user.fcmToken, 'Order Shipped', 'Your order has been shipped.');
                await sendDataMessage(user.fcmToken, {
                    action: "order_reload",
                    orderId: order.orderId
                });
                await sendDataMessage(user.fcmToken, {
                    action: "notification_reload"
                });
                await Notification.create({
                    receiverId: buyer._id,
                    orderId: order.orderId,
                    title: 'Order Shipped',
                    content: 'Your order has been shipped.'
                });
            } catch (notificationError) {
                console.log(`Failed to send notification or data message: ${notificationError.message}`);
            }
        }

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));
    } catch (error) {
        console.log(`patchShipOrder ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const patchDeliverOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.id });

        if (!order) return res.status(404).json(HTTPResponse(404, {}, 'Order Not Found'));

        order.orderStatus = 3;
        order.orderDeliveredAt = Date.now();

        await order.save();

        const buyer = await Buyer.findOne({ _id: order.buyerId });
        const user = await User.findOne({ userId: buyer.userId });

        if (user && user.fcmToken) {
            try {
                await sendNotification(user.fcmToken, 'Order Delivered', 'Your order has been delivered.');
                await sendDataMessage(user.fcmToken, {
                    action: "order_reload",
                    orderId: order.orderId
                });
                await sendDataMessage(user.fcmToken, {
                    action: "notification_reload"
                });
                await Notification.create({
                    receiverId: buyer._id,
                    orderId: order.orderId,
                    title: 'Order Delivered',
                    content: 'Your order has been delivered.'
                });
            } catch (notificationError) {
                console.log(`Failed to send notification or data message: ${notificationError.message}`);
            }
        }

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));
    } catch (error) {
        console.log(`patchDeliverOrder ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

const patchRefuseOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.id });

        if (!order) return res.status(404).json(HTTPResponse(404, {}, 'Order Not Found'));

        order.orderStatus = 6;
        order.orderRefusedAt = Date.now();

        await order.save();

        const buyer = await Buyer.findOne({ _id: order.buyerId });
        const user = await User.findOne({ userId: buyer.userId });

        if (user && user.fcmToken) {
            try {
                await sendNotification(user.fcmToken, 'Order Refused', 'Your order has been refused.');
                await sendDataMessage(user.fcmToken, {
                    action: "order_reload",
                    orderId: order.orderId
                });
                await sendDataMessage(user.fcmToken, {
                    action: "notification_reload"
                });
                await Notification.create({
                    receiverId: buyer._id,
                    orderId: order.orderId,
                    title: 'Order Refused',
                    content: 'Your order has been refused.'
                });
            } catch (notificationError) {
                console.log(`Failed to send notification or data message: ${notificationError.message}`);
            }
        }

        res.status(204).json(HTTPResponse(204, {}, 'Successful'));
    } catch (error) {
        console.log(`patchRefuseOrder ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
};

export default {
    getOrders,
    getOrderById,
    patchConfirmOrder,
    patchShipOrder,
    patchDeliverOrder,
    patchRefuseOrder
}
