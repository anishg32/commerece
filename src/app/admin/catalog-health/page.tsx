"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export default function CatalogHealthPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/catalog-health")
      .then((res) => res.json())
      .then((resData) => {
        if (Array.isArray(resData)) {
          setData(resData);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  // Group by parents vs subcategories for cleaner display if desired, or just list parents first.
  const parentCategories = data.filter(c => c.isParent);
  const subCategories = data.filter(c => !c.isParent);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Catalog Health Validation</h1>
        <p className="text-muted-foreground">Monitor your progress towards the 50-product per category target.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parentCategories.map((cat) => (
          <div key={cat._id} className={`p-6 border rounded-xl bg-card relative overflow-hidden ${cat.status === 'COMPLETE' ? 'border-green-200' : 'border-amber-200'}`}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-lg">{cat.name}</h3>
              {cat.status === 'COMPLETE' ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Verified Products</span>
                <span className="font-semibold">{cat.productCount} / {cat.target}</span>
              </div>
              
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${cat.status === 'COMPLETE' ? 'bg-green-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(100, (cat.productCount / cat.target) * 100)}%` }}
                />
              </div>

              {cat.missing > 0 && (
                <p className="text-xs text-amber-600 mt-2 font-medium">
                  {cat.missing} more required to reach target
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {subCategories.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Subcategory Breakdown</h2>
          <div className="bg-card border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Subcategory</th>
                  <th className="text-left p-4 font-medium">Verified Products</th>
                  <th className="text-left p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subCategories.map((sub) => (
                  <tr key={sub._id}>
                    <td className="p-4 font-medium">{sub.name}</td>
                    <td className="p-4">{sub.productCount}</td>
                    <td className="p-4">
                      {sub.status === 'COMPLETE' ? (
                        <span className="text-green-600 font-medium flex items-center gap-1 text-xs bg-green-50 w-fit px-2 py-1 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Complete
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium flex items-center gap-1 text-xs bg-amber-50 w-fit px-2 py-1 rounded-md">
                          <AlertTriangle className="w-3 h-3" /> Incomplete ({sub.missing} missing)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
