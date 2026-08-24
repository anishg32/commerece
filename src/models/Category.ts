import mongoose, { Schema, Document } from "mongoose";

export interface IAttributeDefinition {
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'color';
  options?: string[];
  isRequired: boolean;
  isFilterable: boolean;
  isVariantKey: boolean;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parentId?: mongoose.Types.ObjectId;
  image?: {
    url: string;
    thumbnail?: string;
    altText?: string;
  };
  icon?: string;
  attributes: IAttributeDefinition[];
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
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
    parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    image: {
      url: { type: String },
      thumbnail: { type: String },
      altText: { type: String },
    },
    icon: { type: String },
    attributes: [AttributeDefinitionSchema],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ sortOrder: 1 });

CategorySchema.pre("save", function() {
  if (this.parentId && this.parentId.equals(this._id)) {
    throw new Error("Category cannot be its own parent.");
  }
});

export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
