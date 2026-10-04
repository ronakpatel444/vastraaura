'use client';

import { useEffect, useState } from 'react';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  price: string;
  category: string;
  status: string;
  image: string;
  createdAt: string;
}

export default function SellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/seller/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setProducts(products.filter(p => p._id !== id));
      } else {
        alert('Failed to delete product');
      }
    } catch(err) {
      alert('Error deleting product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-neutral-900">My Products</h1>
        <Link href="/seller/products/new" className="bg-neutral-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-neutral-800 transition-colors">
          <Plus size={18} /> Add Product
        </Link>
      </div>
      
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center animate-pulse">
           <p className="text-neutral-500">Loading your products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center">
          <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900">No products found</h3>
          <p className="text-neutral-500 mt-2">Upload your first product to start selling.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-sm uppercase tracking-wider text-neutral-500 font-medium">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      {product.image && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden relative bg-neutral-100 flex-shrink-0">
                          <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                        </div>
                      )}
                      <span className="font-medium text-neutral-900 line-clamp-1">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-neutral-600">{product.category}</td>
                  <td className="p-4 text-neutral-900 font-medium font-serif">₹{product.price}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {product.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link href={`/seller/products/edit/${product._id}`} className="p-2 inline-block text-neutral-400 hover:text-blue-500 transition-colors" title="Edit">
                      <Edit size={18} />
                    </Link>
                    <button onClick={() => deleteProduct(product._id)} className="p-2 text-neutral-400 hover:text-red-500 transition-colors" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
