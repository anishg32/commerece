import mongoose, { Schema, Document } from "mongoose";

export interface ISubcategory {
  name: string;
  slug: string;
  isActive: boolean;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories: ISubcategory[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    subcategories: [
      {
        name: { type: String, required: true },
        slug: { type: String, required: true },
        isActive: { type: Boolean, default: true },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1 });

export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
