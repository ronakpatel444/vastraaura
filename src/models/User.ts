import mongoose, { Document, Model, Schema } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  INFLUENCER = 'INFLUENCER',
  CUSTOMER = 'CUSTOMER',
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phoneNumber?: string;
  
  // Seller specific fields
  businessName?: string;
  panCardNumber?: string;
  gstNumber?: string;
  hasOfflineShop?: boolean;
  sellingCategories?: string[]; // e.g., ['Mens', 'Womens', 'Kids', 'Clothing', 'Accessories']
  
  pickupAddress?: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  shippingOptions?: {
    name: string;
    rate: number;
    enabled: boolean;
  }[];
  
  // Influencer specific fields
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    facebook?: string;
  };

  // General Financial/Payout info for Sellers and Influencers
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };

  // Status for approval workflow
  status: 'pending' | 'active' | 'suspended';
  
  // OTP for 2FA
  otp?: string;
  otpExpiry?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    otp: { type: String },
    otpExpiry: { type: Date },
    role: { 
      type: String, 
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
      required: true 
    },
    phoneNumber: { type: String },

    businessName: { type: String },
    panCardNumber: { type: String },
    gstNumber: { type: String },
    hasOfflineShop: { type: Boolean, default: false },
    sellingCategories: { type: [String], default: [] },
    
    pickupAddress: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    shippingOptions: {
      type: [
        {
          name: { type: String },
          rate: { type: Number },
          enabled: { type: Boolean, default: true }
        }
      ],
      default: []
    },

    socialLinks: {
      instagram: { type: String },
      youtube: { type: String },
      facebook: { type: String },
    },

    bankDetails: {
      accountName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
    },

    status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'active' },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

