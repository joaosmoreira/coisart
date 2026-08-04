import mongoose, { Schema, Document } from 'mongoose';
import { ICategory } from '../types/index.js';

export interface ICategoryDocument extends Omit<ICategory, '_id'>, Document {}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true }
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategoryDocument>('Category', CategorySchema);
