import mongoose, { Schema, Document } from "mongoose";

export interface ISiteSettings extends Document {
  codEnabled: boolean;
  codMinAmount: number;
  codMaxAmount: number;
  taxRate: number;
  freeShippingThreshold: number;
  shippingRate: number;
  currency: string;
  updatedAt: Date;
}

const SiteSettingsSchema: Schema = new Schema(
  {
    codEnabled: { type: Boolean, default: true },
    codMinAmount: { type: Number, default: 0 },
    codMaxAmount: { type: Number, default: 50000 },
    taxRate: { type: Number, default: 0.18 }, // 18% GST
    freeShippingThreshold: { type: Number, default: 500 },
    shippingRate: { type: Number, default: 50 },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

// Helper to get or create settings (singleton)
SiteSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
