import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  storeName: string;
  contactEmail: string;
  storeDescription: string;
  currency: string;
  flatShippingRate: number;
  freeShippingThreshold: number;
}

const SettingsSchema = new Schema(
  {
    storeName: { type: String, default: 'VASTRA AURA' },
    contactEmail: { type: String, default: 'hello@vastraaura.com' },
    storeDescription: { type: String, default: 'Luxury Indian fashion and heritage craftsmanship.' },
    currency: { type: String, default: 'INR' },
    flatShippingRate: { type: Number, default: 250 },
    freeShippingThreshold: { type: Number, default: 10000 },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
