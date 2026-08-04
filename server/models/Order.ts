import mongoose, { Schema, Document } from 'mongoose';
import { IOrder } from '../types/index.js';

export interface IOrderDocument extends Omit<IOrder, '_id'>, Document {}

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    type: { type: String, enum: ['physical', 'physical_unique', 'physical_multiple', 'digital'], required: true },
    isPhysicalPrint: { type: Boolean, default: false }
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema(
  {
    street: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String }
  },
  { _id: false }
);

const OrderSchema: Schema = new Schema(
  {
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, trim: true, default: '' },
    customerNif: { type: String, trim: true, default: '' },
    customerAddress: { type: ShippingAddressSchema },
    deliveryMethod: {
      type: String,
      enum: ['digital', 'fair_pickup', 'cafe_pickup', 'shipping'],
      required: true
    },
    shippingAddress: { type: ShippingAddressSchema },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed'
    },
    isResend: { type: Boolean, default: false },
    resendReason: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrderDocument>('Order', OrderSchema);
