import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  service: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      maxlength: [500, 'Comment cannot be more than 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per service
ReviewSchema.index({ service: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
ReviewSchema.statics.getAverageRating = async function (serviceId) {
  const obj = await this.aggregate([
    {
      $match: { service: serviceId },
    },
    {
      $group: {
        _id: '$service',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  try {
    if (obj[0]) {
      await mongoose.model('Service').findByIdAndUpdate(serviceId, {
        rating: obj[0].averageRating.toFixed(1),
        reviewCount: obj[0].reviewCount,
      });
    } else {
      await mongoose.model('Service').findByIdAndUpdate(serviceId, {
        rating: 0,
        reviewCount: 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function () {
  // @ts-ignore
  this.constructor.getAverageRating(this.service);
});

// Call getAverageRating after remove
ReviewSchema.post('deleteOne', function () {
  // @ts-ignore
  this.constructor.getAverageRating(this.service);
});

export default mongoose.model<IReview>('Review', ReviewSchema);

