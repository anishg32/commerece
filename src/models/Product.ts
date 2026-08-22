import mongoose, { Schema, Document } from "mongoose";

export interface ISpecification {
  key: string;
  value: string;
}

export interface IProductVariant {
  color?: string;
  size?: string;
  sku?: string;
  stock: number;
  price?: number;
  images?: string[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  images: string[];
  thumbnail?: string;
  category: mongoose.Types.ObjectId;
  subcategory?: string;
  brand?: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  activePrice: number;
  stock: number;
  sku: string;
  colors?: string[];
  sizes?: string[];
  variants?: IProductVariant[];
  specifications?: ISpecification[];
  rating: number;
  numReviews: number;
  tags?: string[];
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    images: [{ type: String }],
    thumbnail: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: String },
    brand: { type: String },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    discountPercentage: { type: Number },
    activePrice: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true, unique: true },
    colors: [{ type: String }],
    sizes: [{ type: String }],
    variants: [
      {
        color: { type: String },
        size: { type: String },
        sku: { type: String },
        stock: { type: Number, default: 0 },
        price: { type: Number },
        images: [{ type: String }],
      },
    ],
    specifications: [
      {
        key: { type: String },
        value: { type: String },
      },
    ],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-calculate discount percentage and active price on save
ProductSchema.pre("save", function (this: IProduct) {
  if (this.discountPrice && this.price) {
    this.discountPercentage = Math.round(
      ((this.price - this.discountPrice) / this.price) * 100
    );
    this.activePrice = this.discountPrice;
  } else {
    this.discountPercentage = 0;
    this.activePrice = this.price;
  }
});

// Indexes for faster queries
ProductSchema.index({ name: "text", description: "text", brand: "text", tags: "text" });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1, isDeleted: 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ isBestseller: 1, isActive: 1 });
ProductSchema.index({ isNewArrival: 1, isActive: 1 });
ProductSchema.index({ activePrice: 1 });
ProductSchema.index({ createdAt: -1 });

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
