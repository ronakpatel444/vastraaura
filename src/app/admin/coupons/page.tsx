'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AdminCouponsPage() {
  const { adminCoupons, fetchCoupons, addCoupon, deleteCoupon, adminProducts, fetchProducts } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: 10,
    applicableProductIds: [] as string[],
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
    if (adminProducts.length === 0) {
      fetchProducts();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addCoupon(formData);
    if (success) {
      setIsAdding(false);
      setFormData({ code: '', discountPercent: 10, applicableProductIds: [], isActive: true });
    } else {
      alert('Failed to add coupon. Code might already exist.');
    }
  };

  const handleProductToggle = (id: string) => {
    setFormData(prev => {
      const exists = prev.applicableProductIds.includes(id);
      if (exists) {
        return { ...prev, applicableProductIds: prev.applicableProductIds.filter(pid => pid !== id) };
      } else {
        return { ...prev, applicableProductIds: [...prev.applicableProductIds, id] };
      }
    });
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Coupons</h1>
          <p className="text-sm md:text-base text-gray-500">Manage discount codes for your store.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> {isAdding ? 'Cancel' : 'Create Coupon'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 mb-8 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold mb-6">Create New Coupon</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Coupon Code</label>
                <input 
                  required
                  type="text" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 uppercase focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g. FESTIVAL50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Discount Percentage (%)</label>
                <input 
                  required
                  type="number" 
                  min="1" max="100"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({...formData, discountPercent: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block mb-2">Applicable Products (Leave unselected to apply to ALL products)</label>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {adminProducts.map(product => (
                  <label key={product.id} className="flex items-center gap-3 bg-white p-2 border border-gray-200 rounded cursor-pointer hover:border-black">
                    <input 
                      type="checkbox"
                      checked={formData.applicableProductIds.includes(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                      className="accent-black w-4 h-4 flex-shrink-0"
                    />
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={product.image} className="w-8 h-8 object-cover rounded flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{product.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg w-full md:w-auto">
              Save Coupon
            </button>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Code</th>
              <th className="px-6 py-4 font-medium">Discount</th>
              <th className="px-6 py-4 font-medium">Applicable To</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {adminCoupons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No coupons found.
                </td>
              </tr>
            )}
            {adminCoupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{coupon.code}</td>
                <td className="px-6 py-4">{coupon.discountPercent}%</td>
                <td className="px-6 py-4 text-gray-500">
                  {coupon.applicableProductIds.length === 0 ? 'All Products' : `${coupon.applicableProductIds.length} Products`}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => deleteCoupon(coupon.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
