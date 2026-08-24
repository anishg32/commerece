import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Papa from "papaparse";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "CSV file is required" }, { status: 400 });
    }

    const text = await file.text();
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
    });

    const validRows: Record<string, any>[] = [];
    const invalidRows: { row: number; errors: string[]; data: any }[] = [];

    // Check for existing SKUs
    const allSkus = (parsed.data as Record<string, unknown>[])
      .map((row) => (row.SKU as string) || (row.sku as string))
      .filter(Boolean);
    const existingProducts = await Product.find({
      sku: { $in: allSkus },
    }).select("sku");
    const existingSkuSet = new Set(existingProducts.map((p) => p.sku));

    for (let i = 0; i < parsed.data.length; i++) {
      const row = parsed.data[i] as Record<string, unknown>;
      const errors: string[] = [];

      const name = (row.Name as string) || (row.name as string) || "";
      const sku = (row.SKU as string) || (row.sku as string) || "";
      const price = parseFloat((row.Price as string) || (row.price as string) || "0");
      const stock = parseInt((row.Stock as string) || (row.stock as string) || "0");
      const category = (row.Category as string) || (row.category as string) || "";

      if (!name.trim()) errors.push("Name is required");
      if (!sku.trim()) errors.push("SKU is required");
      if (!price || price <= 0) errors.push("Valid price is required");
      if (stock < 0) errors.push("Stock cannot be negative");
      if (!category.trim()) errors.push("Category is required");

      if (existingSkuSet.has(sku)) {
        errors.push(`SKU "${sku}" already exists`);
      }

      if (errors.length > 0) {
        invalidRows.push({ row: i + 2, errors, data: row }); // +2 for header + 0-index
      } else {
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        validRows.push({
          name: name.trim(),
          slug: `${slug}-${Date.now()}-${i}`,
          brand: ((row.Brand as string) || (row.brand as string) || "").trim(),
          description: ((row.Description as string) || (row.description as string) || name).trim(),
          shortDescription: ((row["Short Description"] as string) || (row.shortDescription as string) || "").trim(),
          price,
          discountPrice: parseFloat((row["Discount Price"] as string) || (row.discountPrice as string) || "0") || undefined,
          sku: sku.trim(),
          stock,
          images: ((row["Image URLs"] as string) || (row.images as string) || (row.imageUrls as string) || "")
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
            .map((url: string) => ({
              url,
              altText: name.trim(),
              source: "import",
              sourceType: "url",
              isVerified: false
            })),
          tags: ((row.Tags as string) || (row.tags as string) || "")
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
          status: ((row.Status as string) || (row.status as string) || "PENDING_VERIFICATION").toUpperCase(),
          isActive: ((row.Status as string) || (row.status as string))?.toUpperCase() === "ACTIVE",
          // Category will be resolved by name
          _categoryName: category.trim(),
        });
      }
    }

    // Resolve category names to IDs
    const Category = (await import("@/models/Category")).default;
    const categoryNames = [...new Set(validRows.map((r) => r._categoryName))];
    const categories = await Category.find({
      name: { $in: categoryNames.map((n) => new RegExp(`^${n}$`, "i")) },
    });
    const categoryMap = new Map(
      categories.map((c: Record<string, any>) => [c.name.toLowerCase(), c._id])
    );

    const finalValidRows: Record<string, any>[] = [];
    for (const row of validRows) {
      const catId = categoryMap.get(row._categoryName.toLowerCase());
      if (!catId) {
        invalidRows.push({
          row: 0,
          errors: [`Category "${row._categoryName}" not found`],
          data: row,
        });
      } else {
        const { _categoryName, ...rest } = row;
        finalValidRows.push({ ...rest, category: catId });
      }
    }

    let imported = 0;
    if (finalValidRows.length > 0) {
      const result = await Product.insertMany(finalValidRows, {
        ordered: false,
      });
      imported = result.length;
    }

    return NextResponse.json({
      imported,
      valid: finalValidRows.length,
      invalid: invalidRows.length,
      invalidRows: invalidRows.slice(0, 50), // Limit response size
      total: parsed.data.length,
    });
  } catch (error: unknown) {
    return NextResponse.json({ message: (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
