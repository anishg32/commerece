import mongoose, { Schema, Document } from "mongoose";

export interface INewsletter extends Document {
  email: string;
  isActive: boolean;
  subscribedAt: Date;
}

const NewsletterSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Newsletter || mongoose.model<INewsletter>("Newsletter", NewsletterSchema);
