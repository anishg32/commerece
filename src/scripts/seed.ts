import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Schemas need to be imported so Mongoose knows about them
import Product from "../models/Product";
import Category from "../models/Category";
import User from "../models/User";
import SiteSettings from "../models/SiteSettings";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("MongoDB Connected...");
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();
    await SiteSettings.deleteMany();

    console.log("Cleared existing data.");

    // Create Admin User
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await User.create({
      name: "Admin User",
      email: "admin@luxe.com",
      password: adminPassword,
      role: "admin",
    });

    console.log("Created Admin User: admin@luxe.com / admin123");

    // Initialize Site Settings
    await SiteSettings.create({
      codEnabled: true,
      codMinAmount: 0,
      codMaxAmount: 50000,
      taxRate: 0.18,
      freeShippingThreshold: 500,
      shippingRate: 50,
      currency: "INR"
    });
    console.log("Initialized Site Settings");

    // Create Categories
    const categories = await Category.insertMany([
      { name: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800", subcategories: [{ name: "Audio", slug: "audio", isActive: true }, { name: "Computers", slug: "computers", isActive: true }] },
      { name: "Fashion", slug: "fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800", subcategories: [{ name: "Men", slug: "men", isActive: true }, { name: "Women", slug: "women", isActive: true }] },
      { name: "Home", slug: "home", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800", subcategories: [{ name: "Furniture", slug: "furniture", isActive: true }, { name: "Decor", slug: "decor", isActive: true }] },
      { name: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800" },
    ]);
    // Create Products

    const imagePool = [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800",
    ];

    console.log("Generating 100 products per category...");
    const generatedProducts = [];
    for (const cat of categories) {
      for (let i = 0; i < 100; i++) {
        const hasDiscount = faker.datatype.boolean({ probability: 0.3 });
        const price = parseInt(faker.commerce.price({ min: 1000, max: 90000 }));
        const discountPrice = hasDiscount ? Math.floor(price * faker.number.float({ min: 0.6, max: 0.9 })) : undefined;
        const stock = faker.number.int({ min: 0, max: 200 });
        const image = faker.helpers.arrayElement(imagePool);
        const subcat = cat.subcategories && cat.subcategories.length > 0 ? cat.subcategories[0].name : undefined;
        
        const productName = faker.commerce.productName();
        generatedProducts.push({
          name: productName + " " + faker.string.alphanumeric(3).toUpperCase(),
          slug: faker.helpers.slugify(productName + "-" + faker.string.uuid()).toLowerCase(),
          description: faker.commerce.productDescription(),
          shortDescription: faker.lorem.sentence(),
          images: [image],
          thumbnail: image,
          category: cat._id,
          subcategory: subcat,
          brand: faker.company.name(),
          price: price,
          discountPrice: discountPrice,
          stock: stock,
          sku: faker.string.alphanumeric(8).toUpperCase(),
          colors: faker.helpers.arrayElements(["Black", "White", "Silver", "Gold", "Blue", "Red"], { min: 1, max: 3 }),
          sizes: cat.slug === "fashion" ? ["S", "M", "L", "XL"] : undefined,
          tags: [cat.slug, faker.commerce.productAdjective()],
          rating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
          numReviews: faker.number.int({ min: 0, max: 500 }),
          isFeatured: faker.datatype.boolean({ probability: 0.1 }),
          isBestseller: faker.datatype.boolean({ probability: 0.1 }),
          isNewArrival: faker.datatype.boolean({ probability: 0.2 }),
        });
      }
    }

    console.log(`Inserting ${generatedProducts.length} products... (this might take a few seconds)`);
    // Insert in batches of 50 to avoid memory issues
    for (let i = 0; i < generatedProducts.length; i += 50) {
        const batch = generatedProducts.slice(i, i + 50);
        await Promise.all(batch.map(p => Product.create(p)));
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
