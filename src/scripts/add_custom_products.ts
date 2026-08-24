import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Since we are running outside Next.js, we need to register models manually if needed, 
// or just use raw mongoose connections.
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  price: Number,
  discountPrice: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  images: [{
    url: String,
    altText: String,
    source: String,
    sourceType: { type: String, default: 'url' },
    isVerified: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
  }],
  thumbnail: String,
  stock: Number,
  sku: String,
  attributes: { type: Map, of: mongoose.Schema.Types.Mixed },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  tags: [String],
  isFeatured: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  status: { type: String, enum: ['ACTIVE', 'DRAFT', 'ARCHIVED'], default: 'ACTIVE' },
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  isActive: { type: Boolean, default: true }
});

const BrandSchema = new mongoose.Schema({
  name: String,
  slug: String
});

// Avoid OverwriteModelError
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);

const customProducts = [
  {
    name: "Walertoice Luxury Chronograph Watch",
    slug: "walertoice-luxury-chronograph",
    description: "Premium gold and black chronograph watch.",
    price: 15000,
    discountPrice: 12500,
    categoryName: "Watches",
    brandName: "Walertoice",
    thumbnail: "/images/uploads/0792054ae083e3f3413c2b0b38d01868.jpg",
    stock: 50,
    sku: "WT-CHRONO-01",
    isFeatured: true
  },
  {
    name: "Premium Wireless Earbuds Pro",
    slug: "premium-wireless-earbuds-pro",
    description: "High-fidelity audio with active noise cancellation.",
    price: 12999,
    discountPrice: 9999,
    categoryName: "Headphones",
    brandName: "AudioPro",
    thumbnail: "/images/uploads/1a83c8eab1ef20410ad25ca5d394df03.jpg",
    stock: 100,
    sku: "AP-BUDS-PRO",
    isFeatured: true
  },
  {
    name: "OUPINKE Open Heart Mechanical Watch",
    slug: "oupinke-open-heart-mechanical",
    description: "Exquisite mechanical watch with an open heart design and dual-tone stainless steel.",
    price: 24500,
    discountPrice: 19999,
    categoryName: "Watches",
    brandName: "OUPINKE",
    thumbnail: "/images/uploads/37681fce8fab071dd3e6a16e62acd96c.jpg",
    stock: 25,
    sku: "OUP-MECH-02",
    isFeatured: true
  },
  {
    name: "Samsung Family Hub Smart Refrigerator",
    slug: "samsung-family-hub-fridge",
    description: "Smart refrigerator with built-in touchscreen and cameras.",
    price: 185000,
    discountPrice: 165000,
    categoryName: "Refrigerators",
    brandName: "Samsung",
    thumbnail: "/images/uploads/7a572adb48c9c530dacac2a28238d756.jpg",
    stock: 10,
    sku: "SAM-FHUB-04",
    isFeatured: true
  },
  {
    name: "Cuisinart Hurricane Pro Blender",
    slug: "cuisinart-hurricane-pro-blender",
    description: "Professional-grade blender for all your culinary needs.",
    price: 18999,
    discountPrice: 14999,
    categoryName: "Mixer Grinders",
    brandName: "Cuisinart",
    thumbnail: "/images/uploads/b5c729eab870dc74951810f7f307c0d7.jpg",
    stock: 30,
    sku: "CUI-HURR-PRO",
    isFeatured: true
  },
  {
    name: "Poedagar Diamond Studded Watch",
    slug: "poedagar-diamond-studded",
    description: "Elegant luxury watch featuring diamond accents and a moon phase display.",
    price: 18000,
    discountPrice: 15500,
    categoryName: "Watches",
    brandName: "Poedagar",
    thumbnail: "/images/uploads/d6d695a469e8423cb1b69ed67a3319e5.jpg",
    stock: 40,
    sku: "POE-DIA-03",
    isFeatured: true
  }
];

async function addCustomProducts() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB');

    for (const item of customProducts) {
      // Find or create category
      let category = await Category.findOne({ name: item.categoryName });
      if (!category) {
        const slug = item.categoryName.toLowerCase().replace(/\s+/g, '-');
        category = await Category.create({ name: item.categoryName, slug });
      }

      // Find or create brand
      let brand = await Brand.findOne({ name: item.brandName });
      if (!brand) {
        const slug = item.brandName.toLowerCase().replace(/\s+/g, '-');
        brand = await Brand.create({ name: item.brandName, slug });
      }

      // Upsert product
      const productData = {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        discountPrice: item.discountPrice,
        category: category._id,
        brand: brand._id,
        thumbnail: item.thumbnail,
        images: [{
          url: item.thumbnail,
          altText: item.name,
          source: 'local',
          sourceType: 'file',
          isVerified: true,
          sortOrder: 0
        }],
        stock: item.stock,
        sku: item.sku,
        isFeatured: item.isFeatured,
        isActive: true,
        status: 'ACTIVE'
      };

      await Product.findOneAndUpdate(
        { slug: item.slug },
        productData,
        { upsert: true, new: true }
      );
      
      console.log(`Added/Updated: ${item.name}`);
    }

    console.log('All custom products added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding products:', error);
    process.exit(1);
  }
}

addCustomProducts();
