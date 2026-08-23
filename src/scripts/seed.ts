import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import Product from "../models/Product";
import Category from "../models/Category";
import Brand from "../models/Brand";
import User from "../models/User";
import SiteSettings from "../models/SiteSettings";
import bcrypt from "bcryptjs";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("MongoDB Connected...");
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

const loadJSON = (filename: string) => {
  const filePath = path.resolve(process.cwd(), "src", "data", filename);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  }
  console.warn(`Warning: ${filePath} not found.`);
  return [];
};

const seedData = async () => {
  try {
    await connectDB();

    await Product.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await User.deleteMany();
    await SiteSettings.deleteMany();
    console.log("Cleared existing data.");

    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await User.create({
      name: "Admin User",
      email: "admin@luxe.com",
      password: adminPassword,
      role: "admin",
    });

    await SiteSettings.create({
      codEnabled: true,
      codMinAmount: 0,
      codMaxAmount: 50000,
      taxRate: 0.18,
      freeShippingThreshold: 500,
      shippingRate: 50,
      currency: "INR"
    });

    // 1. Brands
    const brandsData = loadJSON("brands.json");
    const brands = await Brand.insertMany(brandsData);
    const brandMap = brands.reduce((acc: any, b: any) => { acc[b.slug] = b._id; return acc; }, {});
    console.log(`Inserted ${brands.length} brands.`);

    // 2. Categories
    const categoriesData = loadJSON("categories.json");
    const categories = await Category.insertMany(categoriesData);
    const catMap = categories.reduce((acc: any, cat: any) => { acc[cat.slug] = cat._id; return acc; }, {});
    console.log(`Inserted ${categories.length} categories.`);

    // 3. Products
    const productsData = loadJSON("products.json");
    
    // Process products to map slugs to ObjectIds and add strict authenticity fields
    const processedProducts = productsData.map((p: any) => {
      // Map ObjectIds
      p.category = catMap[p.categorySlug];
      p.brand = brandMap[p.brandSlug];
      
      // We must map subcategory slug to the actual name if needed, but the schema takes a string. 
      // Usually it's better to store just the slug or name. The current schema expects a string.
      p.subcategory = p.subcategorySlug;
      
      // Cleanup custom fields not in schema
      delete p.categorySlug;
      delete p.subcategorySlug;
      delete p.brandSlug;
      
      // Strict Verification Workflow additions
      p.isActive = true;
      p.status = "ACTIVE";
      p.verifiedAt = new Date();
      p.verifiedBy = admin._id;
      p.sourceType = "Official Manufacturer";
      p.rating = 0;
      p.numReviews = 0;
      p.images = p.images || [];

      return p;
    });

    await Product.insertMany(processedProducts);
    console.log(`Inserted ${processedProducts.length} verified products.`);

    console.log("Database seeded successfully with JSON modular pipeline!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
