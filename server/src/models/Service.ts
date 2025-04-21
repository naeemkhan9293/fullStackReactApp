import mongoose, { Document, Schema } from 'mongoose';

interface ServiceOption {
  name: string;
  price: number;
  description: string;
}

export interface IService extends Document {
  name: string;
  provider: mongoose.Types.ObjectId;
  category: string;
  description: string;
  basePrice: number;
  options: ServiceOption[];
  availableTimeSlots: string[];
  icon?: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  status: 'active' | 'draft' | 'paused';
  views: number;
  bookings: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, 'Please add a service name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['Home', 'Outdoor', 'Education', 'Pets', 'Tech', 'Health', 'Beauty', 'Other'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Please add a base price'],
      min: [0, 'Price must be a positive number'],
    },
    options: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: [0, 'Price must be a positive number'],
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
    availableTimeSlots: [
      {
        type: String,
      },
    ],
    icon: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot be more than 5'],
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'paused'],
      default: 'draft',
    },
    views: {
      type: Number,
      default: 0,
    },
    bookings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for reviews
ServiceSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'service',
  justOne: false,
});

export default mongoose.model<IService>('Service', ServiceSchema);
