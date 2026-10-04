import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPayout extends Document {
  userId?: mongoose.Types.ObjectId | string;
  userType: 'seller' | 'influencer';
  amount: number;
  status: 'Pending' | 'Paid' | 'Rejected';
  method: string;
  reference: string;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    upiId?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>(
  {
    userId: { type: Schema.Types.Mixed },
    userType: { type: String, enum: ['seller', 'influencer'], default: 'seller' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Rejected'], default: 'Pending' },
    method: { type: String, default: 'Bank Transfer' },
    reference: { type: String, required: true },
    bankDetails: {
      accountName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      upiId: { type: String },
    },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

const Payout: Model<IPayout> = mongoose.models.Payout || mongoose.model<IPayout>('Payout', PayoutSchema);

export default Payout;
