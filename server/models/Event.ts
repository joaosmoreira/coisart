import mongoose, { Schema, Document } from 'mongoose';

export interface IParticipatingSeller {
  sellerId: mongoose.Types.ObjectId;
  promoPhotoUrl?: string;
}

export interface IEvent extends Document {
  title: string;
  date: string;
  time: string;
  location: string;
  bannerUrl: string;
  description: string;
  participatingSellers: IParticipatingSeller[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    bannerUrl: { type: String, default: '' },
    description: { type: String, required: true },
    participatingSellers: [
      {
        sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
        promoPhotoUrl: { type: String, default: '' }
      }
    ],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Event = mongoose.model<IEvent>('Event', eventSchema);
