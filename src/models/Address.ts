import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  houseBuilding: string;
  street: string;
  area?: string;
  city: string;
  district?: string;
  state: string;
  pinCode: string;
  country: string;
  landmark?: string;
  addressType: "Home" | "Work" | "Other";
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema: Schema<IAddress> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    houseBuilding: {
      type: String,
      required: [true, "House/Building details are required"],
    },
    street: {
      type: String,
      required: [true, "Street details are required"],
    },
    area: {
      type: String,
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    district: {
      type: String,
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    pinCode: {
      type: String,
      required: [true, "PIN/Postal code is required"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      default: "India",
    },
    landmark: {
      type: String,
    },
    addressType: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from compiling the model multiple times in Next.js development
const Address: Model<IAddress> =
  mongoose.models.Address || mongoose.model<IAddress>("Address", AddressSchema);

export default Address;
