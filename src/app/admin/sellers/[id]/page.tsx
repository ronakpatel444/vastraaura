'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Store, CreditCard, Banknote, Clock, Package, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function AdminSellerDetails() {
  const { id } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerDetails();
  }, [id]);

  const fetchSellerDetails = async () => {
    try {
      const res = await fetch(`/api/admin/sellers/${id}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch seller details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-neutral-500">Loading seller profile...</div>;
  }

  if (!data || !data.seller) {
    return <div className="p-10 text-red-500">Seller not found.</div>;
  }

  const { seller, products, stats } = data;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-serif text-neutral-900 flex items-center gap-3">
            <Store size={28} className="text-accent" /> {seller.businessName || seller.name}
          </h1>
          <p className="text-neutral-500 mt-1">{seller.email} • {seller.phone} • Status: <span className="font-medium text-black">{seller.status?.toUpperCase()}</span></p>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
            <CreditCard size={18} /> Online Payments
          </div>
          <p className="text-3xl font-bold text-neutral-900">₹{(stats?.onlineSales || 0).toLocaleString()}</p>
          <p className="text-sm text-neutral-500 mt-1">Direct to your platform</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-orange-500 font-medium mb-2">
            <Banknote size={18} /> Offline (COD) Sales
          </div>
          <p className="text-3xl font-bold text-neutral-900">₹{(stats?.codSales || 0).toLocaleString()}</p>
          <p className="text-sm text-neutral-500 mt-1">To be collected by courier</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
            <Clock size={18} /> Pending Payouts
          </div>
          <p className="text-3xl font-bold text-neutral-900">₹{(stats?.pendingPayout || 0).toLocaleString()}</p>
          <p className="text-sm text-neutral-500 mt-1">Requested by seller</p>
        </div>
      </div>

      {/* Seller Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Package size={20} /> Seller's Products ({products?.length || 0})
          </h2>
        </div>
        
        {products?.length === 0 ? (
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-10 text-center text-neutral-500">
            This seller has not uploaded any products yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <div key={product._id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
                {/* Product Image */}
                <div className="relative w-full aspect-[3/4] bg-neutral-100">
                  <Image 
                    src={product.images?.[0] || product.image || '/images/placeholder.jpg'} 
                    alt={product.name} 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white p-1.5 rounded-md text-neutral-700 hover:text-black shadow"><Edit size={14}/></button>
                    <button className="bg-white p-1.5 rounded-md text-red-500 hover:text-red-700 shadow"><Trash2 size={14}/></button>
                  </div>
                </div>
                
                {/* Product Details */}
                <div className="p-4 flex flex-col">
                  <h3 className="text-sm font-medium text-neutral-900 line-clamp-2 mb-1">{product.name}</h3>
                  <p className="text-xs text-neutral-500 mb-2">{product.category}</p>
                  
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <p className="text-lg font-bold text-neutral-900 font-serif">₹{product.price}</p>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                      product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {product.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
