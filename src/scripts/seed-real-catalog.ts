import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load env vars
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
if (!process.env.MONGODB_URI) {
  dotenv.config(); // fallback
}

import Product from "../models/Product";
import Category from "../models/Category";
import Brand from "../models/Brand";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const realProductsData = [
  {
    name: "Apple iPhone 15 Pro Max (256GB)",
    brandName: "Apple",
    categoryName: "Smartphones",
    description: "The iPhone 15 Pro Max features a strong and light aerospace-grade titanium design, A17 Pro chip, and a powerful 48MP Main camera system.",
    shortDescription: "Titanium design, A17 Pro chip, 48MP camera.",
    price: 159900,
    discountPrice: 149900,
    sku: "APL-IP15PM-256",
    stock: 120,
    status: "ACTIVE",
    images: [
      {
        url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1000",
        altText: "iPhone 15 Pro Max Titanium",
        source: "unsplash",
        sourceType: "url",
        isVerified: true
      }
    ],
    tags: ["smartphone", "apple", "iphone", "ios", "titanium"],
    attributes: {
      "Storage": "256GB",
      "Color": "Natural Titanium",
      "RAM": "8GB"
    }
  },
  {
    name: "Samsung Galaxy S24 Ultra (512GB)",
    brandName: "Samsung",
    categoryName: "Smartphones",
    description: "Galaxy S24 Ultra sets a new standard with Galaxy AI. Features a titanium exterior, 200MP camera, and Snapdragon 8 Gen 3 processor.",
    shortDescription: "Galaxy AI, Titanium exterior, 200MP camera.",
    price: 139999,
    discountPrice: 129999,
    sku: "SAM-S24U-512",
    stock: 85,
    status: "ACTIVE",
    images: [
      {
        url: "https://images.unsplash.com/photo-1707227155694-871638202956?auto=format&fit=crop&q=80&w=1000",
        altText: "Samsung Galaxy S24 Ultra",
        source: "unsplash",
        sourceType: "url",
        isVerified: true
      }
    ],
    tags: ["smartphone", "samsung", "galaxy", "android"],
    attributes: {
      "Storage": "512GB",
      "Color": "Titanium Black",
      "RAM": "12GB"
    }
  },
  {
    name: "Sony WH-1000XM5 Wireless Headphones",
    brandName: "Sony",
    categoryName: "Headphones",
    description: "Industry-leading noise cancellation. Two processors control 8 microphones for unprecedented noise cancellation.",
    shortDescription: "Industry-leading noise canceling headphones.",
    price: 29990,
    discountPrice: 24990,
    sku: "SNY-WH1000XM5",
    stock: 200,
    status: "ACTIVE",
    images: [
      {
        url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1000",
        altText: "Sony WH-1000XM5 Black",
        source: "unsplash",
        sourceType: "url",
        isVerified: true
      }
    ],
    tags: ["audio", "headphones", "sony", "wireless", "noise-canceling"],
    attributes: {
      "Color": "Black",
      "Type": "Over-Ear"
    }
  },
  {
    name: "Apple MacBook Pro 16-inch (M3 Max)",
    brandName: "Apple",
    categoryName: "Laptops",
    description: "The 16-inch MacBook Pro with M3 Max is a powerhouse. Up to 128GB of unified memory and hardware-accelerated ray tracing.",
    shortDescription: "M3 Max, 16-inch Liquid Retina XDR display.",
    price: 349900,
    discountPrice: 329900,
    sku: "APL-MBP16-M3MAX",
    stock: 45,
    status: "ACTIVE",
    images: [
      {
        url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000",
        altText: "MacBook Pro 16-inch",
        source: "unsplash",
        sourceType: "url",
        isVerified: true
      }
    ],
    tags: ["laptop", "apple", "macbook", "m3", "pro"],
    attributes: {
      "Processor": "M3 Max",
      "RAM": "36GB",
      "Storage": "1TB SSD",
      "Color": "Space Black"
    }
  },
  {
    name: "Nike Air Max 270",
    brandName: "Nike",
    categoryName: "Footwear",
    description: "Nike's first lifestyle Air Max brings you style, comfort and big attitude in the Nike Air Max 270. The design draws inspiration from Air Max icons.",
    shortDescription: "Lifestyle Air Max with superior comfort.",
    price: 13995,
    discountPrice: 11995,
    sku: "NKE-AM270-BLK",
    stock: 150,
    status: "ACTIVE",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000",
        altText: "Nike Air Max 270 Red/Black",
        source: "unsplash",
        sourceType: "url",
        isVerified: true
      }
    ],
    tags: ["shoes", "nike", "sneakers", "sports", "fashion"],
    attributes: {
      "Color": "Black/Red",
      "Size": "US 10",
      "Material": "Mesh"
    }
  },
  {
    name: "Sony PlayStation 5 Console",
    brandName: "Sony",
    categoryName: "Gaming",
    description: "Experience lightning-fast loading with an ultra-high-speed SSD, deeper immersion with support for haptic feedback, adaptive triggers and 3D Audio.",
    shortDescription: "Next-gen gaming console with 825GB SSD.",
    price: 54990,
    discountPrice: 49990,
    sku: "SNY-PS5-DISC",
    stock: 60,
    status: "ACTIVE",
    images: [
      {
        url: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=1000",
        altText: "PlayStation 5 Console",
        source: "unsplash",
        sourceType: "url",
        isVerified: true
      }
    ],
    tags: ["gaming", "console", "sony", "ps5", "playstation"],
    attributes: {
      "Storage": "825GB",
      "Color": "White"
    }
  },
  {
    name: "LG C3 65-inch OLED evo 4K Smart TV",
    brandName: "LG",
    categoryName: "TV, Audio & Entertainment",
    description: "Powered by the a9 AI Processor Gen6, the LG OLED evo C3 produces beautiful picture and performance. Brightness Booster improves brightness.",
    shortDescription: "65-inch 4K OLED evo Smart TV.",
    price: 249990,
    discountPrice: 189990,
    sku: "LG-OLED65C3",
    stock: 30,
    status: "ACTIVE",
    images: [
      {
        url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=1000",
        altText: "LG OLED Smart TV",
        source: "unsplash",
        sourceType: "url",
        isVerified: true
      }
    ],
    tags: ["tv", "lg", "oled", "4k", "smart-tv"],
    attributes: {
      "Screen Size": "65 inch",
      "Resolution": "4K Ultra HD",
      "Display Type": "OLED"
    }
  }
];

async function seedRealProducts() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected successfully.");

    let importedCount = 0;

    for (const item of realProductsData) {
      // Find or create Brand
      let brand = await Brand.findOne({ name: item.brandName });
      if (!brand) {
        brand = await Brand.create({
          name: item.brandName,
          slug: item.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: `${item.brandName} brand`
        });
      }

      // Find Category (we will fallback to root 'Electronics' if subcategory not found, or create it)
      let category = await Category.findOne({ name: item.categoryName });
      if (!category) {
        // Find general parent, let's say 'Electronics' or 'Fashion'
        let parentCat = await Category.findOne({ name: "Electronics" });
        if (!parentCat && item.categoryName === "Footwear") {
            parentCat = await Category.findOne({ name: "Fashion" });
        }
        
        category = await Category.create({
          name: item.categoryName,
          slug: item.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: `${item.categoryName} category`,
          parentId: parentCat ? parentCat._id : null,
          level: parentCat ? parentCat.level + 1 : 0
        });
      }

      // Check if product exists
      const existingProduct = await Product.findOne({ sku: item.sku });
      if (existingProduct) {
        console.log(`Product ${item.sku} already exists, skipping.`);
        continue;
      }

      // Create product
      const productSlug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const productData = {
        ...item,
        slug: productSlug,
        brand: brand._id,
        category: category._id,
        isActive: true, // For storefront visibility
        isVerified: true
      };

      await Product.create(productData);
      console.log(`Inserted: ${item.name}`);
      importedCount++;
    }

    console.log(`\nSeed Complete! Successfully inserted ${importedCount} verified products.`);
    process.exit(0);
  } catch (error) {
    console.error("Error during seed:", error);
    process.exit(1);
  }
}

seedRealProducts();
