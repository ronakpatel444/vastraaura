import mongoose, { Schema, Document } from 'mongoose';

export interface IAdSlot extends Document {
  sellerId: string;
  sellerName?: string;
  type: string; // 'Hero Banner', 'Insta Reel', 'Insta Story', 'Insta Post'
  startDate: Date;
  endDate: Date;
  amountPaid: number;
  paymentMethod: string; // 'Wallet Deduction', 'Direct Transfer'
  status: string; // 'Pending', 'Approved', 'Rejected'
  transactionId?: string;
  contentUrl?: string; // Link to the banner/video
  createdAt: Date;
  updatedAt: Date;
}

const AdSlotSchema: Schema = new Schema(
  {
    sellerId: { type: String, required: true },
    sellerName: { type: String },
    type: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    amountPaid: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    transactionId: { type: String },
    contentUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.AdSlot || mongoose.model<IAdSlot>('AdSlot', AdSlotSchema);
