"use client";

import { useEffect, useState } from "react";
import { Star, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !currentStatus })
      });
      fetchReviews();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE"
      });
      fetchReviews();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="animate-pulse p-8">Loading reviews...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Reviews</h1>
        <p className="text-muted-foreground">Manage and moderate customer reviews</p>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 border-b">
            <tr>
              <th className="p-4 font-semibold">Product</th>
              <th className="p-4 font-semibold">User</th>
              <th className="p-4 font-semibold">Rating & Review</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reviews.map((review) => (
              <tr key={review._id} className="hover:bg-secondary/20 transition-colors">
                <td className="p-4 align-top">
                  {review.product ? (
                    <div className="font-medium text-primary hover:underline">
                      <a href={`/products/${review.product._id}`} target="_blank" rel="noreferrer">
                        {review.product.name}
                      </a>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Product Deleted</span>
                  )}
                </td>
                <td className="p-4 align-top">
                  <div className="font-medium">{review.user?.name || "Unknown"}</div>
                  <div className="text-xs text-muted-foreground">{review.user?.email}</div>
                  {review.isVerifiedPurchase && (
                    <div className="text-[10px] text-green-600 bg-green-100 w-fit px-1.5 py-0.5 rounded mt-1">Verified Buyer</div>
                  )}
                </td>
                <td className="p-4 align-top max-w-xs">
                  <div className="flex gap-0.5 text-yellow-500 mb-2">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} className={`w-3 h-3 ${star <= review.rating ? "fill-current" : "text-muted opacity-30"}`} />
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/80 line-clamp-3" title={review.reviewText}>
                    {review.reviewText}
                  </p>
                  <div className="text-[10px] text-muted-foreground mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4 align-top">
                  {review.isApproved ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-100 w-fit px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Approved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-orange-600 text-xs font-semibold bg-orange-100 w-fit px-2 py-1 rounded-full">
                      <XCircle className="w-3 h-3" /> Hidden
                    </span>
                  )}
                </td>
                <td className="p-4 align-top text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleApproval(review._id, review.isApproved)}
                    >
                      {review.isApproved ? "Hide" : "Approve"}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => deleteReview(review._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
