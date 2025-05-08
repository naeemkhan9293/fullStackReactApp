import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  wallet: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'service_payment' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  booking?: mongoose.Types.ObjectId;
  stripePaymentId?: string;
  stripeTransferId?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'service_payment', 'refund'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    stripePaymentId: {
      type: String,
    },
    stripeTransferId: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
