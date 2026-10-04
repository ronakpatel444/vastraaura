import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  storeName: string;
  contactEmail: string;
  storeDescription: string;
  currency: string;
  flatShippingRate: number;
  freeShippingThreshold: number;
  platformCommissionRate: number;
  activeCategories: string[];
  handlingChargeType: 'PERCENTAGE' | 'FIXED';
  handlingChargeValue: number;
  standardCourierFee: number;
  blueDartCourierFee: number;
  adPackage24hPrice: number;
  adPackage3dPrice: number;
  adPackage7dPrice: number;
}

const SettingsSchema = new Schema(
  {
    storeName: { type: String, default: 'VASTRA AURA' },
    contactEmail: { type: String, default: 'hello@vastraaura.com' },
    storeDescription: { type: String, default: 'Luxury Indian fashion and heritage craftsmanship.' },
    currency: { type: String, default: 'INR' },
    flatShippingRate: { type: Number, default: 100 },
    freeShippingThreshold: { type: Number, default: 999 },
    platformCommissionRate: { type: Number, default: 0 },
    activeCategories: { 
      type: [String], 
      default: ['Mens', 'Womens', 'Kids', 'Accessories'] 
    },
    handlingChargeType: { 
      type: String, 
      enum: ['PERCENTAGE', 'FIXED'], 
      default: 'PERCENTAGE' 
    },
    handlingChargeValue: { type: Number, default: 0 }, // If 0, completely hidden from customer
    standardCourierFee: { type: Number, default: 100 }, // ₹100 compulsory
    blueDartCourierFee: { type: Number, default: 120 }, // ₹120 for Blue Dart
    adPackage24hPrice: { type: Number, default: 2000 },
    adPackage3dPrice: { type: Number, default: 5000 },
    adPackage7dPrice: { type: Number, default: 10000 },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
