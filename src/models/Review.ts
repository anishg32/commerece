import mongoose, { Document, Model, Schema } from "mongoose";

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  reviewText: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean; // For admin moderation
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema<IReview> = new Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    reviewText: {
      type: String,
      required: [true, "Review text is required"],
      trim: true,
      maxlength: [1000, "Review text cannot exceed 1000 characters"],
    },
    images: {
      type: [String],
      default: [],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true, // Set to false if you want strict moderation before display
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one user can only leave one review per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Prevent mongoose from compiling the model multiple times in Next.js development
const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
