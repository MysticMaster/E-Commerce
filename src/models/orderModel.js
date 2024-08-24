import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    productVariantId: {type: String, required: true},
    price: {type: Number, required: true},
    quantity: {type: Number, required: true},
    note: String
});

const OrderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true , required: true },
    buyerId: {type: String, required: true},
    vendorId: {type: String, required: true},
    shippingAddress: {type: String, required: true},
    deliveryPhoneNumber: {type: String, required: true},
    deliveryEmail: String,
    discount: {type: Number, required: false, default: 0},
    totalPrice: {type: Number, required: true},
    totalQuantity: {type: Number, required: true},
    note: String,
    orderItem: {type: [OrderItemSchema], required: true},
    orderPlacedAt: {type: Date, default: Date.now},
    orderConfirmedAt: Date,
    orderShippedAt: Date,
    orderDeliveredAt: Date,
    orderReceivedAt: Date,
    orderCancelledAt: Date,
    orderRefusedAt: Date,
    orderStatus: {type: Number, default: 0,},
    status: {type: Boolean, default: true,},
    createdAt: {type: Date, default: Date.now,}
}, {_id: false});

OrderSchema.index({ orderId: 1 });

export default mongoose.model('Order', OrderSchema);