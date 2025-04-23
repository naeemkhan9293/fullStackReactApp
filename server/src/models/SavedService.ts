import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedService extends Document {
  user: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SavedServiceSchema = new Schema<ISavedService>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure a user can't save the same service twice
SavedServiceSchema.index({ user: 1, service: 1 }, { unique: true });

export default mongoose.model<ISavedService>('SavedService', SavedServiceSchema);
