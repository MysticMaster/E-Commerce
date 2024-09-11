import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
    classificationId: String,
    price: {type: Number, required: true},
    quantity: {type: Number, required: true}
});

const OrderSchema = new mongoose.Schema({
    orderId: {type: String, unique: true, required: true},
    buyerId: {type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true},
    vendorId: {type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true},
    recipientName: {type: String, required: true},
    shippingAddress: {type: String, required: true},
    deliveryPhoneNumber: {type: String, required: true},
    deliveryEmail: {type: String, default: ""},
    discount: {type: Number, required: false, default: 0},
    totalPrice: {type: Number, required: true},
    totalQuantity: {type: Number, required: true},
    note: {type: String, default: ""},
    orderItems: {type: [OrderItemSchema], required: true},
    orderPlacedAt: {type: Date, default: Date.now},
    orderConfirmedAt: Date,
    orderShippedAt: Date,
    orderDeliveredAt: Date,
    orderReceivedAt: Date,
    orderCancelledAt: Date,
    orderRefusedAt: Date,
    orderStatus: {
        type: Number,
        default: 0,
        enum: [0, 1, 2, 3, 4, 5, 6] // 0: Pending, 1: Confirmed, 2: Shipped, 3: Delivered, 4: Received, 5: Cancelled, 6: Refused
    },
    status: {type: Boolean, default: true,},
    createdAt: {type: Date, default: Date.now,}
});

OrderSchema.index({orderId: 1});

export default mongoose.model('Order', OrderSchema);
