import mongoose, { Schema, Document } from "mongoose";

export interface IProductImage {
  url: string;
  thumbnailUrl?: string;
  altText: string;
  source: string;
  sourceType: string;
  isVerified: boolean;
  verifiedAt?: Date;
  sortOrder: number;
}

export interface IProductVariant {
  attributes: Map<string, string>; // e.g., { "Size": "M", "Color": "Red" }
  sku?: string;
  stock: number;
  price?: number;
  images?: IProductImage[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  images: IProductImage[];
  thumbnail?: string;
  category: mongoose.Types.ObjectId;
  brand?: mongoose.Types.ObjectId;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  activePrice: number;
  stock: number;
  sku: string;
  
  // Dynamic E-Commerce Engine
  attributes: Map<string, unknown>;
  variants?: IProductVariant[];
  
  rating: number;
  numReviews: number;
  tags?: string[];
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  isDeleted: boolean;
  
  // Verification Workflow Fields
  status: 'DRAFT' | 'PENDING_VERIFICATION' | 'ACTIVE' | 'OUT_OF_STOCK' | 'INACTIVE' | 'REJECTED';
  source?: string;
  sourceType?: string;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    images: [{
      url: { type: String, required: true },
      thumbnailUrl: { type: String },
      altText: { type: String, required: true },
      source: { type: String, required: true },
      sourceType: { type: String, required: true },
      isVerified: { type: Boolean, default: false },
      verifiedAt: { type: Date },
      sortOrder: { type: Number, default: 0 }
    }],
    thumbnail: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    discountPercentage: { type: Number },
    activePrice: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true, unique: true },
    
    // Dynamic Attributes mapped by attribute name
    attributes: {
      type: Map,
      of: Schema.Types.Mixed
    },
    
    // Dynamic Variants mapped by attribute names
    variants: [
      {
        attributes: {
          type: Map,
          of: String
        },
        sku: { type: String },
        stock: { type: Number, default: 0 },
        price: { type: Number },
        images: [{
          url: { type: String, required: true },
          thumbnailUrl: { type: String },
          altText: { type: String, required: true },
          source: { type: String, required: true },
          sourceType: { type: String, required: true },
          isVerified: { type: Boolean, default: false },
          verifiedAt: { type: Date },
          sortOrder: { type: Number, default: 0 }
        }],
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
    
    status: { 
      type: String, 
      enum: ['DRAFT', 'PENDING_VERIFICATION', 'ACTIVE', 'OUT_OF_STOCK', 'INACTIVE', 'REJECTED'],
      default: 'DRAFT'
    },
    source: { type: String },
    sourceType: { type: String },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String },
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
// Note: We remove brand from text index because it's now an ObjectId. Text search can't search ObjectIds effectively without a $lookup pipeline, which happens at controller level.
ProductSchema.index({ name: "text", description: "text", tags: "text" });
ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ isActive: 1, isDeleted: 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ isBestseller: 1, isActive: 1 });
ProductSchema.index({ isNewArrival: 1, isActive: 1 });
ProductSchema.index({ activePrice: 1 });
ProductSchema.index({ createdAt: -1 });

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
