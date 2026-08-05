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

const BillingAddressSchema = new Schema(
  {
    name: { type: String, default: '' },
    nif: { type: String, default: '' },
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' }
  },
  { _id: false }
);

const RecipientDetailsSchema = new Schema(
  {
    name: { type: String, default: '' },
    phone: { type: String, default: '' }
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
    separateShipping: { type: Boolean, default: false },
    recipientDetails: { type: RecipientDetailsSchema },
    shippingAddress: { type: ShippingAddressSchema },
    separateBilling: { type: Boolean, default: false },
    billingDetails: { type: BillingAddressSchema },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['multibanco', 'bank_transfer', 'mbway', 'paypal'],
      default: 'multibanco'
    },
    mbwayPhone: { type: String, default: '' },
    multibancoEntity: { type: String, default: '21523' },
    multibancoReference: { type: String, default: '' },
    notes: { type: String, default: '' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    isResend: { type: Boolean, default: false },
    resendReason: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrderDocument>('Order', OrderSchema);
