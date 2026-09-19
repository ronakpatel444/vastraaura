'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Star } from 'lucide-react';

export default function AdminReviewsPage() {
  const { adminReviews, fetchReviews } = useStore();

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif">Customer Reviews</h1>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 uppercase tracking-widest text-xs text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {adminReviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No reviews yet.
                  </td>
                </tr>
              ) : (
                adminReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {review.productName}
                    </td>
                    <td className="px-6 py-4">
                      {review.customerName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 text-yellow-500">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="truncate" title={review.comment}>
                        {review.comment}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
