import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { resolve } from "path";
import * as fs from "fs";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
if (!process.env.MONGODB_URI) {
  dotenv.config();
}

import Product from "../models/Product";
import Category from "../models/Category";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

async function generateReport() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB. Generating report...");

    const categories = await Category.find();
    let reportMarkdown = `# ARJ STORE Final Catalog Validation Report\n\n`;
    reportMarkdown += `| Category | Product Count | Published | Missing Images | Status |\n`;
    reportMarkdown += `| :--- | :--- | :--- | :--- | :--- |\n`;

    for (const cat of categories) {
      // Find all descendant categories to aggregate products properly
      const getDescendants = async (parentId: any): Promise<any[]> => {
        const children = await Category.find({ parentId });
        let desc = [...children.map(c => c._id)];
        for (const child of children) {
          const deep = await getDescendants(child._id);
          desc = [...desc, ...deep];
        }
        return desc;
      };

      const descendantIds = await getDescendants(cat._id);
      const allCategoryIds = [cat._id, ...descendantIds];

      const products = await Product.find({ category: { $in: allCategoryIds } });
      
      const totalCount = products.length;
      const publishedCount = products.filter(p => p.isActive && p.status === "ACTIVE").length;
      
      // Missing image criteria: NO images array OR length 0 OR URL is placeholder
      const missingImagesCount = products.filter(p => {
        if (!p.images || p.images.length === 0) return true;
        if (!p.images[0].url) return true;
        if (p.images[0].url.includes("placeholder") || p.images[0].url.includes("unavailable")) return true;
        return false;
      }).length;

      const status = publishedCount >= 50 ? "COMPLETE" : "INCOMPLETE";

      reportMarkdown += `| ${cat.name} | ${totalCount} | ${publishedCount} | ${missingImagesCount} | **${status}** |\n`;
    }

    const reportPath = resolve(process.cwd(), "catalog-validation-report.md");
    fs.writeFileSync(reportPath, reportMarkdown);

    console.log(`\nReport generated successfully: ${reportPath}`);
    console.log(reportMarkdown);

    process.exit(0);
  } catch (error) {
    console.error("Error generating report:", error);
    process.exit(1);
  }
}

generateReport();
