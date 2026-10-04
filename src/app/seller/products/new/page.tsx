'use client';

import { useState } from 'react';
import { Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';

export default function AddProduct() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    stock: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        alert('Product successfully added to your store!');
        router.push('/seller/products');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add product');
        setIsLoading(false);
      }
    } catch (err) {
      alert('Network error while saving product');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/seller/products" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-serif text-neutral-900">Add New Product</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 space-y-8">
        
        {/* Basic Info */}
        <div>
          <h2 className="text-xl font-medium text-neutral-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Product Name</label>
              <input type="text" required className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
              <textarea rows={4} required className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-all" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
              <select required className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-all" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="">Select a category</option>
                <option value="Mens">Mens</option>
                <option value="Womens">Womens</option>
                <option value="Kids">Kids</option>
                <option value="Accessories">Accessories</option>
                <option value="Combo Lehengas">Combo Lehengas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="pt-8 border-t border-neutral-100">
          <h2 className="text-xl font-medium text-neutral-900 mb-4">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Selling Price (₹)</label>
              <input type="number" required min="0" className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-all" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Original Price (₹)</label>
              <input type="number" min="0" className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-all" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Stock Quantity</label>
              <input type="number" required min="0" className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-all" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="pt-8 border-t border-neutral-100">
          <h2 className="text-xl font-medium text-neutral-900 mb-4">Product Images</h2>
          <CldUploadWidget 
            uploadPreset="vastra_unsigned" // The user will need to create this in Cloudinary settings
            onSuccess={(result: any) => {
              const url = result?.info?.secure_url;
              if (url) {
                setFormData(prev => ({ ...prev, images: [url] }));
              }
            }}
          >
            {({ open }) => {
              return (
                <div 
                  onClick={() => open()}
                  className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center hover:bg-neutral-50 transition-colors cursor-pointer flex flex-col items-center justify-center group"
                >
                  {formData.images && formData.images[0] ? (
                    <div className="mb-4">
                      <img src={formData.images[0]} alt="Uploaded" className="h-32 object-contain rounded-md" />
                      <p className="text-sm text-green-600 mt-2 font-medium">Image Uploaded Successfully!</p>
                      <p className="text-xs text-neutral-500 mt-1">Click again to replace</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-neutral-200 transition-colors">
                        <Upload className="text-neutral-500" size={24} />
                      </div>
                      <p className="font-medium text-neutral-900">Click to upload images</p>
                      <p className="text-sm text-neutral-500 mt-1">Powered by Cloudinary (JPG, PNG, WEBP)</p>
                    </>
                  )}
                </div>
              );
            }}
          </CldUploadWidget>
        </div>

        {/* Submit */}
        <div className="pt-8 flex justify-end gap-4 border-t border-neutral-100">
          <Link href="/seller/products" className="px-6 py-3 rounded-xl border border-neutral-300 font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={isLoading} className="px-8 py-3 rounded-xl bg-neutral-900 font-medium text-white hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-2">
            {isLoading ? 'Saving...' : 'Save Product'}
          </button>
        </div>

      </form>
    </div>
  );
}
