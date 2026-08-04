import mongoose, { Schema, Document } from 'mongoose';
import { ISeller } from '../types/index.js';

export interface ISellerDocument extends Omit<ISeller, '_id'>, Document {}

const SellerLinkSchema = new Schema(
  {
    platform: { type: String, required: true },
    url: { type: String, required: true }
  },
  { _id: false }
);

const SellerSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    links: [SellerLinkSchema],
    disciplines: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Seller = mongoose.model<ISellerDocument>('Seller', SellerSchema);
