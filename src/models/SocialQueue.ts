import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISocialQueue extends Document {
  productId?: mongoose.Types.ObjectId | string;
  title: string;
  caption: string;
  mediaType: 'IMAGE' | 'CAROUSEL' | 'REEL';
  images: string[];
  videoUrl?: string;
  channels: string[];
  status: 'PENDING' | 'PROCESSING' | 'PUBLISHED' | 'FAILED';
  scheduledAt: Date;
  publishedAt?: Date;
  error?: string;
  attempts: number;
  results?: any;
  createdAt: Date;
  updatedAt: Date;
}

const SocialQueueSchema = new Schema<ISocialQueue>(
  {
    productId: { type: Schema.Types.Mixed },
    title: { type: String, required: true },
    caption: { type: String, required: true },
    mediaType: { 
      type: String, 
      enum: ['IMAGE', 'CAROUSEL', 'REEL'], 
      default: 'IMAGE' 
    },
    images: { type: [String], default: [] },
    videoUrl: { type: String, default: '' },
    channels: { 
      type: [String], 
      default: ['instagram_feed', 'facebook_page'] 
    },
    status: { 
      type: String, 
      enum: ['PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED'], 
      default: 'PENDING',
      index: true 
    },
    scheduledAt: { type: Date, required: true, index: true },
    publishedAt: { type: Date },
    error: { type: String, default: '' },
    attempts: { type: Number, default: 0 },
    results: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Prevent re-compilation in development
export default (mongoose.models.SocialQueue as Model<ISocialQueue>) || 
  mongoose.model<ISocialQueue>('SocialQueue', SocialQueueSchema);
