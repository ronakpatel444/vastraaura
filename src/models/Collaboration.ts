import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICollaboration extends Document {
  sellerId?: mongoose.Types.ObjectId | string;
  sellerName: string;
  sellerEmail?: string;
  influencerId?: mongoose.Types.ObjectId | string;
  influencerName: string;
  influencerHandle: string;
  productName: string;
  productImage?: string;
  campaignType: string; // 'Instagram Reel', 'Story Mention', 'Video Showcase', 'Exclusive Post'
  budget: number;
  status: 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Declined';
  instructions?: string;
  targetDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CollaborationSchema = new Schema<ICollaboration>(
  {
    sellerId: { type: Schema.Types.Mixed },
    sellerName: { type: String, required: true },
    sellerEmail: { type: String },
    influencerId: { type: Schema.Types.Mixed },
    influencerName: { type: String, required: true },
    influencerHandle: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String },
    campaignType: { type: String, required: true, default: 'Instagram Reel' },
    budget: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Declined'],
      default: 'Pending',
    },
    instructions: { type: String },
    targetDate: { type: String },
  },
  {
    timestamps: true,
  }
);

const Collaboration: Model<ICollaboration> =
  mongoose.models.Collaboration ||
  mongoose.model<ICollaboration>('Collaboration', CollaborationSchema);

export default Collaboration;
