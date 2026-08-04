import { Request } from 'express';

export type UserRole = 'admin' | 'seller';

export interface IUser {
  _id?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt?: Date;
}

export interface ISellerLink {
  platform: string;
  url: string;
}

export interface ISeller {
  _id?: string;
  userId: string;
  name: string;
  slug: string;
  bio: string;
  avatarUrl: string;
  links: ISellerLink[];
  disciplines?: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: Date;
}

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
}

export type ProductType = 'physical_unique' | 'physical_multiple' | 'digital' | 'physical';

export interface IProduct {
  _id?: string;
  sellerId: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  materials?: string;
  price: number;
  type: ProductType;
  digitalFileUrl?: string;
  allowPhysicalPrint?: boolean;
  physicalPrintPrice?: number;
  images: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt?: Date;
}

export type DeliveryMethod = 'digital' | 'fair_pickup' | 'cafe_pickup' | 'shipping';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface IShippingAddress {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface IOrderItem {
  productId: string;
  sellerId: string;
  title: string;
  price: number;
  quantity: number;
  type: ProductType;
  isPhysicalPrint?: boolean;
}

export interface IOrder {
  _id?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  customerNif?: string;
  customerAddress?: IShippingAddress;
  deliveryMethod: DeliveryMethod;
  shippingAddress?: IShippingAddress;
  items: IOrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  isResend?: boolean;
  resendReason?: string;
  createdAt?: Date;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  sellerId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}
