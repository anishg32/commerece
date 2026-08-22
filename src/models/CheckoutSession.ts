import mongoose, { Schema, Document } from "mongoose";

export interface ICheckoutItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  variant?: {
    color?: string;
    size?: string;
    [key: string]: string | undefined;
  };
}

export interface ICheckoutSession extends Document {
  userId: mongoose.Types.ObjectId;
  type: "buy_now" | "cart";
  items: ICheckoutItem[];
  shippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  paymentMethod?: "razorpay" | "cod";
  itemsPrice: number;
  discountAmount: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  razorpayOrderId?: string;
  status: "pending" | "payment_initiated" | "completed" | "expired" | "failed";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CheckoutSessionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["buy_now", "cart"], required: true },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        quantity: { type: Number, required: true },
        variant: { type: Schema.Types.Mixed },
      },
    ],
    shippingAddress: {
      fullName: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    customerInfo: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
    paymentMethod: { type: String, enum: ["razorpay", "cod"] },
    itemsPrice: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    razorpayOrderId: { type: String },
    status: {
      type: String,
      enum: ["pending", "payment_initiated", "completed", "expired", "failed"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    },
  },
  { timestamps: true }
);

// TTL index: auto-delete expired sessions after 1 hour past expiry
CheckoutSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });
CheckoutSessionSchema.index({ userId: 1, status: 1 });
CheckoutSessionSchema.index({ razorpayOrderId: 1 });

export default mongoose.models.CheckoutSession ||
  mongoose.model<ICheckoutSession>("CheckoutSession", CheckoutSessionSchema);
