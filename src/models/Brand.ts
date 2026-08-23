import mongoose, { Schema, Document } from "mongoose";

export interface IBrand extends Document {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  categories: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }]
  },
  { timestamps: true }
);

BrandSchema.index({ slug: 1 });
BrandSchema.index({ isActive: 1 });

export default mongoose.models.Brand ||
  mongoose.model<IBrand>("Brand", BrandSchema);
