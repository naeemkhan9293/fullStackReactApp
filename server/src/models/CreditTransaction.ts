import mongoose, { Document, Schema } from 'mongoose';

export interface ICreditTransaction extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  type: 'subscription' | 'purchase' | 'usage' | 'refund' | 'adjustment';
  description: string;
  reference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CreditTransactionSchema = new Schema<ICreditTransaction>(
  {
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
      enum: ['subscription', 'purchase', 'usage', 'refund', 'adjustment'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICreditTransaction>('CreditTransaction', CreditTransactionSchema);
