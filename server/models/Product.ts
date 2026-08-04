import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '../types/index.js';

export interface IProductDocument extends Omit<IProduct, '_id'>, Document {}

const ProductSchema: Schema = new Schema(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    materials: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ['physical', 'physical_unique', 'physical_multiple', 'digital'],
      default: 'physical_unique'
    },
    digitalFileUrl: { type: String },
    allowPhysicalPrint: { type: Boolean, default: false },
    physicalPrintPrice: { type: Number, default: 0 },
    images: [{ type: String, required: true }],
    stock: { type: Number, required: true, default: 1 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProductDocument>('Product', ProductSchema);
