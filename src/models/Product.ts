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
  colorDetails?: {
    name: string;
    image: string;
  }[];
  sizes: {
    name: string;
    stock: number;
  }[];
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
    colorDetails: {
      type: [
        {
          name: { type: String },
          image: { type: String },
        }
      ],
      default: []
    },
    sizes: {
      type: [
        {
          name: { type: String },
          stock: { type: Number, default: 0 },
        }
      ],
      default: []
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from recompiling the model upon hot reload
const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
