import mongoose, { Schema, Document } from "mongoose";

export interface ISubcategory {
  name: string;
  slug: string;
  isActive: boolean;
}

export interface IAttributeDefinition {
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'color';
  options?: string[]; // Used for select, multiselect, or color
  isRequired: boolean;
  isFilterable: boolean;
  isVariantKey: boolean;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: {
    url: string;
    thumbnail?: string;
    altText?: string;
  };
  subcategories: ISubcategory[];
  attributes: IAttributeDefinition[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttributeDefinitionSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['text', 'number', 'select', 'multiselect', 'color'], required: true },
  options: [{ type: String }],
  isRequired: { type: Boolean, default: false },
  isFilterable: { type: Boolean, default: true },
  isVariantKey: { type: Boolean, default: false }
});

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image: {
      url: { type: String },
      thumbnail: { type: String },
      altText: { type: String },
    },
    subcategories: [
      {
        name: { type: String, required: true },
        slug: { type: String, required: true },
        isActive: { type: Boolean, default: true },
      },
    ],
    attributes: [AttributeDefinitionSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1 });

export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
