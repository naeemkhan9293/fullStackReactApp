import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
  user: mongoose.Types.ObjectId;
  userType: 'customer' | 'provider';
  balance: number;
  isActive: boolean;
  stripeAccountId?: string;
  stripeCustomerId?: string;
  bankAccountConnected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    userType: {
      type: String,
      enum: ['customer', 'provider'],
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stripeAccountId: {
      type: String,
    },
    stripeCustomerId: {
      type: String,
    },
    bankAccountConnected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IWallet>('Wallet', WalletSchema);
