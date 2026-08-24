import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
import Category from "../models/Category";
import Brand from "../models/Brand";
import Product from "../models/Product";
import User from "../models/User";
import Review from "../models/Review";
import Order from "../models/Order";
import Coupon from "../models/Coupon";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) throw new Error("MONGODB_URI is required");

const catImages = {
  electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1000",
  mobiles: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1000",
  computers: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1000",
  tv: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=1000",
  cameras: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000",
  gaming: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=1000",
  smartHome: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1000",
  homeAppliances: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000",
  kitchenAppliances: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=1000",
  fashion: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1000",
  mensFashion: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=1000",
  womensFashion: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000",
  kidsFashion: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=1000",
  footwear: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000",
  watches: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1000",
  jewelry: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1000",
  beauty: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=1000",
  health: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1000",
  homeFurniture: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000",
  homeDecor: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1000",
  kitchenDining: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1000",
  beddingBath: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1000",
  garden: "https://images.unsplash.com/photo-1416879598553-3379a1f5926c?auto=format&fit=crop&q=80&w=1000",
  sports: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1000",
  books: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=1000",
  stationery: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=1000",
  toys: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=1000",
  baby: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=1000",
  automotive: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000",
  tools: "https://images.unsplash.com/photo-1581166397057-235af2b3c6dd?auto=format&fit=crop&q=80&w=1000",
  travel: "https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&q=80&w=1000",
  pet: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=1000",
  musical: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=1000",
  grocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000",
  groceryEssentials: "https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&q=80&w=1000",
  officeSupplies: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000",
  industrial: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000",
  art: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1000",
  giftCards: "https://images.unsplash.com/photo-1606778303024-f725355152f0?auto=format&fit=crop&q=80&w=1000",
};

const categoryData = [
  { name: "Electronics", slug: "electronics", image: catImages.electronics, subcategories: ["Headphones", "Earbuds", "Speakers", "Bluetooth Speakers", "Smart Watches", "Power Banks", "Chargers", "Cables", "Computer Accessories", "Keyboard", "Mouse", "Webcams", "Microphones", "Storage Devices", "USB Hubs", "Networking Devices"] },
  { name: "Mobiles & Tablets", slug: "mobiles-and-tablets", image: catImages.mobiles, subcategories: ["Smartphones", "Feature Phones", "Tablets", "Mobile Cases", "Screen Protectors", "Chargers", "Power Banks", "Cables", "Mobile Accessories", "Smart Watches", "Tablet Accessories"] },
  { name: "Computers & Laptops", slug: "computers-and-laptops", image: catImages.computers, subcategories: ["Laptops", "Gaming Laptops", "Desktop Computers", "Monitors", "Keyboards", "Mice", "Printers", "Scanners", "Webcams", "Routers", "SSDs", "Hard Drives", "RAM", "Graphics Cards", "Laptop Accessories", "Computer Components"] },
  { name: "TV, Audio & Entertainment", slug: "tv-audio-entertainment", image: catImages.tv, subcategories: ["Smart TVs", "LED TVs", "QLED TVs", "OLED TVs", "Streaming Devices", "Soundbars", "Home Theater", "Speakers", "Projectors", "TV Accessories", "Remote Controls"] },
  { name: "Cameras & Photography", slug: "cameras-photography", image: catImages.cameras, subcategories: ["DSLR Cameras", "Mirrorless Cameras", "Action Cameras", "Digital Cameras", "Camera Lenses", "Tripods", "Camera Bags", "Memory Cards", "Camera Batteries", "Camera Accessories"] },
  { name: "Gaming", slug: "gaming", image: catImages.gaming, subcategories: ["Gaming Consoles", "Gaming Controllers", "Gaming Headsets", "Gaming Keyboards", "Gaming Mice", "Gaming Monitors", "Gaming Chairs", "PC Games", "Console Games", "Gaming Accessories"] },
  { name: "Smart Home", slug: "smart-home", image: catImages.smartHome, subcategories: ["Smart Lights", "Smart Plugs", "Smart Cameras", "Smart Doorbells", "Smart Speakers", "Smart Displays", "Smart Sensors", "Home Security", "Smart Switches"] },
  { name: "Home Appliances", slug: "home-appliances", image: catImages.homeAppliances, subcategories: ["Refrigerators", "Washing Machines", "Air Conditioners", "Air Coolers", "Air Purifiers", "Vacuum Cleaners", "Water Purifiers", "Irons", "Fans", "Geysers", "Room Heaters"] },
  { name: "Kitchen Appliances", slug: "kitchen-appliances", image: catImages.kitchenAppliances, subcategories: ["Microwave Ovens", "Air Fryers", "Mixer Grinders", "Blenders", "Electric Kettles", "Coffee Makers", "Toasters", "Induction Cooktops", "Rice Cookers", "OTGs", "Juicers"] },
  { name: "Fashion", slug: "fashion", image: catImages.fashion, subcategories: ["Men", "Women", "Kids", "Footwear", "Accessories"] },
  { name: "Men's Fashion", slug: "mens-fashion", image: catImages.mensFashion, subcategories: ["T-Shirts", "Shirts", "Jeans", "Trousers", "Jackets", "Sweatshirts", "Ethnic Wear", "Formal Wear", "Innerwear", "Accessories"] },
  { name: "Women's Fashion", slug: "womens-fashion", image: catImages.womensFashion, subcategories: ["Tops", "Dresses", "Sarees", "Kurtis", "Salwar Suits", "Jeans", "Trousers", "Jackets", "Ethnic Wear", "Western Wear", "Accessories"] },
  { name: "Kids' Fashion", slug: "kids-fashion", image: catImages.kidsFashion, subcategories: ["Boys Clothing", "Girls Clothing", "Baby Clothing", "School Wear", "Party Wear", "Shoes", "Accessories"] },
  { name: "Footwear", slug: "footwear", image: catImages.footwear, subcategories: ["Men's Shoes", "Women's Shoes", "Kids' Shoes", "Sports Shoes", "Running Shoes", "Sandals", "Slippers", "Formal Shoes", "Boots", "Casual Shoes"] },
  { name: "Watches", slug: "watches", image: catImages.watches, subcategories: ["Men's Watches", "Women's Watches", "Smart Watches", "Sports Watches", "Analog Watches", "Digital Watches", "Watch Accessories"] },
  { name: "Jewelry & Accessories", slug: "jewelry-accessories", image: catImages.jewelry, subcategories: ["Rings", "Earrings", "Necklaces", "Bracelets", "Chains", "Pendants", "Jewelry Accessories"] },
  { name: "Beauty & Personal Care", slug: "beauty-personal-care", image: catImages.beauty, subcategories: ["Skincare", "Haircare", "Makeup", "Fragrances", "Bath & Body", "Grooming", "Oral Care", "Beauty Tools"] },
  { name: "Health & Wellness", slug: "health-wellness", image: catImages.health, subcategories: ["Fitness Equipment", "Wellness Products", "Personal Care", "Health Monitoring Devices", "Medical Devices", "Yoga Equipment"] },
  { name: "Home & Furniture", slug: "home-furniture", image: catImages.homeFurniture, subcategories: ["Sofas", "Beds", "Tables", "Chairs", "Cabinets", "Wardrobes", "Office Furniture", "Storage Furniture", "Mattresses"] },
  { name: "Home Decor", slug: "home-decor", image: catImages.homeDecor, subcategories: ["Wall Decor", "Lighting", "Clocks", "Mirrors", "Curtains", "Rugs", "Cushions", "Decorative Items"] },
  { name: "Kitchen & Dining", slug: "kitchen-dining", image: catImages.kitchenDining, subcategories: ["Cookware", "Dinnerware", "Glassware", "Kitchen Storage", "Cutlery", "Kitchen Tools", "Containers", "Dining Accessories"] },
  { name: "Bedding & Bath", slug: "bedding-bath", image: catImages.beddingBath, subcategories: ["Bedsheets", "Blankets", "Towels", "Pillows", "Bath Mats", "Bath Accessories"] },
  { name: "Garden & Outdoor", slug: "garden-outdoor", image: catImages.garden, subcategories: ["Plants", "Pots", "Garden Tools", "Outdoor Furniture", "BBQ & Grills"] },
  { name: "Sports & Fitness", slug: "sports-fitness", image: catImages.sports, subcategories: ["Gym Equipment", "Fitness Accessories", "Running", "Cycling", "Football", "Cricket", "Basketball", "Badminton", "Tennis", "Outdoor Sports", "Sports Accessories"] },
  { name: "Books", slug: "books", image: catImages.books, subcategories: ["Fiction", "Non-Fiction", "Academic", "Competitive Exams", "Children's Books", "Comics", "Technology", "Business", "Self Development", "Reference Books"] },
  { name: "Stationery & Office", slug: "stationery-office", image: catImages.stationery, subcategories: ["Notebooks", "Pens", "Pencils", "Files", "Folders", "Art Supplies", "Office Accessories", "Printing Supplies"] },
  { name: "Toys & Games", slug: "toys-games", image: catImages.toys, subcategories: ["Educational Toys", "Building Toys", "Board Games", "Puzzles", "Remote Control Toys", "Outdoor Toys", "Dolls", "Action Figures"] },
  { name: "Baby Products", slug: "baby-products", image: catImages.baby, subcategories: ["Baby Clothing", "Diapers", "Baby Care", "Feeding", "Baby Furniture", "Strollers", "Toys", "Safety Products"] },
  { name: "Automotive", slug: "automotive", image: catImages.automotive, subcategories: ["Car Accessories", "Bike Accessories", "Car Electronics", "Cleaning Products", "Interior Accessories", "Exterior Accessories", "Tools", "Maintenance Products"] },
  { name: "Tools & Hardware", slug: "tools-hardware", image: catImages.tools, subcategories: ["Hand Tools", "Power Tools", "Measuring Tools", "Electrical Tools", "Hardware", "Safety Equipment", "Workshop Equipment"] },
  { name: "Travel & Luggage", slug: "travel-luggage", image: catImages.travel, subcategories: ["Suitcases", "Backpacks", "Travel Bags", "Laptop Bags", "Travel Accessories", "Travel Organizers"] },
  { name: "Pet Supplies", slug: "pet-supplies", image: catImages.pet, subcategories: ["Dog Supplies", "Cat Supplies", "Pet Food", "Toys", "Grooming", "Beds", "Accessories"] },
  { name: "Musical Instruments", slug: "musical-instruments", image: catImages.musical, subcategories: ["Guitars", "Keyboards", "Drums", "Violins", "Microphones", "Audio Equipment", "Instrument Accessories"] },
  { name: "Grocery & Gourmet Food", slug: "grocery-gourmet-food", image: catImages.grocery, subcategories: ["Snacks", "Beverages", "Chocolates", "Gourmet Foods"] },
  { name: "Grocery Essentials", slug: "grocery-essentials", image: catImages.groceryEssentials, subcategories: ["Rice & Grains", "Oils", "Spices", "Dal & Pulses"] },
  { name: "Office & School Supplies", slug: "office-school-supplies", image: catImages.officeSupplies, subcategories: ["Paper", "Writing Instruments", "Calculators", "School Bags"] },
  { name: "Industrial & Professional Supplies", slug: "industrial-professional-supplies", image: catImages.industrial, subcategories: ["Safety Gear", "Testing Instruments", "Packaging Supplies", "Cleaning Supplies"] },
  { name: "Art & Craft Supplies", slug: "art-craft-supplies", image: catImages.art, subcategories: ["Paints", "Brushes", "Canvases", "Craft Kits"] },
  { name: "Gift Cards", slug: "gift-cards", image: catImages.giftCards, subcategories: ["Birthday", "Anniversary", "Corporate", "Wedding"] },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB");

    console.log("Clearing existing data...");
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});
    await Coupon.deleteMany({});

    console.log("Creating Brands...");
    const brands = await Brand.insertMany([
      { name: "Apple", slug: "apple", isActive: true },
      { name: "Samsung", slug: "samsung", isActive: true },
      { name: "Dell", slug: "dell", isActive: true },
      { name: "Sony", slug: "sony", isActive: true },
      { name: "Nike", slug: "nike", isActive: true },
      { name: "Adidas", slug: "adidas", isActive: true },
      { name: "LG", slug: "lg", isActive: true },
      { name: "Dyson", slug: "dyson", isActive: true },
      { name: "KitchenAid", slug: "kitchenaid", isActive: true },
      { name: "L'Oreal", slug: "loreal", isActive: true },
      { name: "Fitbit", slug: "fitbit", isActive: true },
      { name: "Penguin Classics", slug: "penguin-classics", isActive: true },
      { name: "IKEA", slug: "ikea", isActive: true },
      { name: "Canon", slug: "canon", isActive: true },
      { name: "Nikon", slug: "nikon", isActive: true },
      { name: "Ray-Ban", slug: "ray-ban", isActive: true },
      { name: "Casio", slug: "casio", isActive: true },
      { name: "Philips", slug: "philips", isActive: true },
    ]);

    const brandMap = brands.reduce((map, b) => {
      map[b.slug] = b._id;
      return map;
    }, {} as Record<string, mongoose.Types.ObjectId>);

    console.log("Creating Categories...");
    const subcategoryDocs: any = {};

    for (let i = 0; i < categoryData.length; i++) {
      const data = categoryData[i];
      const parentCat = await Category.create({
        name: data.name,
        slug: data.slug,
        sortOrder: i,
        isActive: true,
        seoTitle: `${data.name} | ARJ STORE Marketplace`,
        seoDescription: `Shop the best ${data.name} online at ARJ STORE Marketplace.`,
        image: { url: data.image, altText: data.name }
      });

      if (data.subcategories && data.subcategories.length > 0) {
        for (let j = 0; j < data.subcategories.length; j++) {
          const subName = data.subcategories[j];
          const subSlug = `${data.slug}-${subName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
          
          const subCat = await Category.create({
            name: subName,
            slug: subSlug,
            parentId: parentCat._id,
            sortOrder: j,
            isActive: true,
            seoTitle: `${subName} | ${data.name} | ARJ STORE Marketplace`,
            seoDescription: `Buy ${subName} online at ARJ STORE Marketplace.`
          });
          subcategoryDocs[subSlug] = subCat._id;
        }
      }
    }

    console.log("Creating Products...");
    
    const products = [
      {
        name: "iPhone 15 Pro",
        slug: "iphone-15-pro",
        description: "Forged in titanium and featuring the groundbreaking A17 Pro chip.",
        images: [
          { url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=1000", altText: "iPhone 15 Pro Main", isVerified: true, source: "unsplash", sourceType: "url" },
          { url: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&q=80&w=1000", altText: "iPhone 15 Pro Display", isVerified: true, source: "unsplash", sourceType: "url" },
        ],
        thumbnail: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=1000",
        category: subcategoryDocs["mobiles-and-tablets-smartphones"],
        brand: brandMap["apple"],
        price: 129900,
        stock: 50,
        sku: "APP-IP15P-128",
        attributes: { Color: "Space Gray", Storage: "128GB" },
        isFeatured: true, isBestseller: true, status: 'ACTIVE', isActive: true
      },
      {
        name: "MacBook Pro 16-inch M3",
        slug: "macbook-pro-16",
        description: "Supercharged by M3 Pro and M3 Max.",
        images: [{ url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000", altText: "MacBook Pro", isVerified: true, source: "unsplash", sourceType: "url" }],
        thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000",
        category: subcategoryDocs["computers-and-laptops-laptops"],
        brand: brandMap["apple"],
        price: 249900,
        stock: 30,
        sku: "APP-MBP16-M3",
        attributes: { Color: "Silver", RAM: "16GB", Storage: "512GB" },
        isFeatured: true, status: 'ACTIVE', isActive: true
      },
      {
        name: "Sony WH-1000XM5",
        slug: "sony-wh-1000xm5",
        description: "Industry-leading noise cancellation headphones.",
        images: [{ url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1000", altText: "Sony Headphones", isVerified: true, source: "unsplash", sourceType: "url" }],
        thumbnail: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1000",
        category: subcategoryDocs["electronics-headphones"],
        brand: brandMap["sony"],
        price: 34990, discountPrice: 29990,
        stock: 100, sku: "SON-WH1000XM5",
        attributes: { Color: "Black" },
        isBestseller: true, status: 'ACTIVE', isActive: true
      },
      {
        name: "Nike Air Force 1 '07",
        slug: "nike-air-force-1-07",
        description: "The radiance lives on in the Nike Air Force 1 '07.",
        images: [{ url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000", altText: "Nike Air Force 1", isVerified: true, source: "unsplash", sourceType: "url" }],
        thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000",
        category: subcategoryDocs["footwear-men-s-shoes"],
        brand: brandMap["nike"],
        price: 9695, stock: 200, sku: "NIK-AF1-07",
        attributes: { Color: "White", Size: "US 10" },
        isFeatured: true, status: 'ACTIVE', isActive: true
      },
      {
        name: "Adidas Ultraboost 1.0",
        slug: "adidas-ultraboost-1-0",
        description: "Iconic running shoes for everyday wear.",
        images: [{ url: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&q=80&w=1000", altText: "Adidas Ultraboost", isVerified: true, source: "unsplash", sourceType: "url" }],
        thumbnail: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&q=80&w=1000",
        category: subcategoryDocs["footwear-sports-shoes"],
        brand: brandMap["adidas"],
        price: 17999, discountPrice: 12999, stock: 150, sku: "ADI-UB1",
        attributes: { Color: "Core Black", Size: "US 9" },
        isFeatured: false, status: 'ACTIVE', isActive: true
      },
      {
        name: "LG C3 65-inch OLED evo 4K Smart TV",
        slug: "lg-c3-65-oled",
        description: "Experience the brilliant beauty of LG OLED evo.",
        images: [{ url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=1000", altText: "LG OLED TV", isVerified: true, source: "unsplash", sourceType: "url" }],
        thumbnail: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=1000",
        category: subcategoryDocs["tv-audio-entertainment-oled-tvs"],
        brand: brandMap["lg"],
        price: 249900, discountPrice: 169900, stock: 15, sku: "LG-C3-65",
        attributes: { "Screen Size": "65 inch" },
        isFeatured: true, status: 'ACTIVE', isActive: true
      },
      {
        name: "KitchenAid Artisan Series 5 Quart",
        slug: "kitchenaid-artisan-5qt",
        description: "Make up to 9 dozen cookies in a single batch with the KitchenAid Artisan Series.",
        images: [{ url: "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?auto=format&fit=crop&q=80&w=1000", altText: "KitchenAid", isVerified: true, source: "unsplash", sourceType: "url" }],
        thumbnail: "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?auto=format&fit=crop&q=80&w=1000",
        category: subcategoryDocs["kitchen-appliances-mixer-grinders"],
        brand: brandMap["kitchenaid"],
        price: 45000, stock: 25, sku: "KA-ART5-RED",
        attributes: { Color: "Empire Red" },
        isFeatured: true, status: 'ACTIVE', isActive: true
      },
      {
        name: "L'Oreal Paris Revitalift Hyaluronic Acid Serum",
        slug: "loreal-revitalift-serum",
        description: "Intensively hydrating 1.5% pure Hyaluronic Acid Serum.",
        images: [{ url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=1000", altText: "Loreal Serum", isVerified: true, source: "unsplash", sourceType: "url" }],
        thumbnail: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=1000",
        category: subcategoryDocs["beauty-personal-care-skincare"],
        brand: brandMap["loreal"],
        price: 999, discountPrice: 799, stock: 300, sku: "LOR-HA-SERUM",
        attributes: { "Skin Type": "All" },
        isBestseller: true, status: 'ACTIVE', isActive: true
      },
      {
        name: "Dyson V15 Detect Absolute",
        slug: "dyson-v15-detect",
        description: "The most powerful, intelligent cordless vacuum.",
        images: [{ url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000", altText: "Dyson V15", isVerified: true, source: "unsplash", sourceType: "url" }],
        thumbnail: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000",
        category: subcategoryDocs["home-appliances-vacuum-cleaners"],
        brand: brandMap["dyson"],
        price: 74900, stock: 40, sku: "DYS-V15",
        isBestseller: true, status: 'ACTIVE', isActive: true
      },
      {
        name: "Canon EOS R6 Mark II",
        slug: "canon-eos-r6-mkii",
        description: "High-performance hybrid mirrorless camera.",
        images: [{ url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000", altText: "Canon Camera", isVerified: true, source: "unsplash", sourceType: "url" }],
        thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000",
        category: subcategoryDocs["cameras-photography-mirrorless-cameras"],
        brand: brandMap["canon"],
        price: 243995, stock: 12, sku: "CAN-R6M2",
        status: 'ACTIVE', isActive: true
      },
      {
        name: "Casio G-Shock G-Steel",
        slug: "casio-gshock-gsteel",
        description: "Tough solar analog-digital watch.",
        images: [{ url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1000", altText: "Casio Watch", isVerified: true, source: "unsplash", sourceType: "url" }],
        thumbnail: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1000",
        category: subcategoryDocs["watches-men-s-watches"],
        brand: brandMap["casio"],
        price: 24995, discountPrice: 19995, stock: 60, sku: "CAS-GST",
        status: 'ACTIVE', isActive: true
      },
      {
        name: "1984 by George Orwell",
        slug: "1984-george-orwell",
        description: "A dystopian social science fiction novel and cautionary tale.",
        images: [{ url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=1000", altText: "1984 Book", isVerified: true, source: "unsplash", sourceType: "url" }],
        thumbnail: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=1000",
        category: subcategoryDocs["books-fiction"],
        brand: brandMap["penguin-classics"],
        price: 399, stock: 500, sku: "BOK-1984",
        status: 'ACTIVE', isActive: true
      },
      {
        name: "Ray-Ban Aviator Classic",
        slug: "ray-ban-aviator",
        description: "Currently one of the most iconic sunglass models in the world.",
        images: [{ url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=1000", altText: "Ray-Ban", isVerified: true, source: "unsplash", sourceType: "url" }],
        thumbnail: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=1000",
        category: subcategoryDocs["fashion-accessories"],
        brand: brandMap["ray-ban"],
        price: 9490, stock: 120, sku: "RAY-AVI",
        status: 'ACTIVE', isActive: true
      }
    ];

    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products.`);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
