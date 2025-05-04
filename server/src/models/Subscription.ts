import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  subscriptionType: 'regular' | 'premium';
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      required: true,
    },
    subscriptionType: {
      type: String,
      enum: ['regular', 'premium'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired'],
      required: true,
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    canceledAt: {
      type: Date,
    },
    trialStart: {
      type: Date,
    },
    trialEnd: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
