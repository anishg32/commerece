import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function updateCats() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
  
  await Category.findOneAndUpdate({ name: "Watches" }, { $set: { image: { url: "/images/uploads/0792054ae083e3f3413c2b0b38d01868.jpg", altText: "Watches" } } });
  await Category.findOneAndUpdate({ name: "Headphones" }, { $set: { image: { url: "/images/uploads/1a83c8eab1ef20410ad25ca5d394df03.jpg", altText: "Headphones" } } });
  await Category.findOneAndUpdate({ name: "Refrigerators" }, { $set: { image: { url: "/images/uploads/7a572adb48c9c530dacac2a28238d756.jpg", altText: "Refrigerators" } } });
  await Category.findOneAndUpdate({ name: "Mixer Grinders" }, { $set: { image: { url: "/images/uploads/b5c729eab870dc74951810f7f307c0d7.jpg", altText: "Mixer Grinders" } } });
  
  console.log("Categories updated.");
  process.exit(0);
}
updateCats();
