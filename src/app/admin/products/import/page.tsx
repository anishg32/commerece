"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Download, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImportProductsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data);
    } catch (error: unknown) {
      alert((error instanceof Error ? error.message : String(error)) || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = "Name,Brand,Category,Price,Discount Price,SKU,Stock,Description,Image URLs,Tags\nExample Product,BrandName,Electronics,999,799,SKU-001,50,Product description,https://example.com/img.jpg,tag1 tag2";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Products</h1>
          <p className="text-muted-foreground">Bulk import from CSV</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">CSV File</h2>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" /> Download Template
          </Button>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-all"
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">Click to select CSV file</p>
              <p className="text-xs text-muted-foreground mt-1">Required columns: Name, SKU, Price, Stock, Category</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />

        <Button onClick={handleImport} disabled={!file || importing} className="w-full">
          {importing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</> : "Start Import"}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Import Results</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <div className="text-2xl font-bold">{result.total}</div>
              <div className="text-sm text-muted-foreground">Total Rows</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{result.imported}</div>
              <div className="text-sm text-green-600">Imported</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{result.invalid}</div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
          </div>

          {result.invalidRows?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-destructive">Errors</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {result.invalidRows.map((row: any, i: number) => (
                  <div key={i} className="text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                    <span className="font-medium">Row {row.row}:</span> {row.errors.join(", ")}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.imported > 0 && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Successfully imported {result.imported} products</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
