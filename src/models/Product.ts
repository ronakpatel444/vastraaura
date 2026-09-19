import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: string;
  originalPrice?: string;
  allowCOD: boolean;
  category: string;
  status: string;
  image: string;
  images?: string[];
  fabric: string;
  description: string;
  originalSellerLink?: string;
  colors: string[];
  stockBySize: {
    XS: number;
    S: number;
    M: number;
    L: number;
    XL: number;
    XXL: number;
  };
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    originalPrice: { type: String },
    allowCOD: { type: Boolean, default: true },
    category: { type: String, required: true },
    status: { type: String, required: true, default: 'Active' },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    fabric: { type: String },
    description: { type: String },
    originalSellerLink: { type: String },
    colors: { type: [String], default: [] },
    stockBySize: {
      XS: { type: Number, default: 0 },
      S: { type: Number, default: 0 },
      M: { type: Number, default: 0 },
      L: { type: Number, default: 0 },
      XL: { type: Number, default: 0 },
      XXL: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from recompiling the model upon hot reload
const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
