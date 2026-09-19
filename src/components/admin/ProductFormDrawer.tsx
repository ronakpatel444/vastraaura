'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore, AdminProduct, StockBySize } from '@/store/useStore';

interface ProductFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: AdminProduct | null;
}

export default function ProductFormDrawer({ isOpen, onClose, productToEdit }: ProductFormDrawerProps) {
  const { addProduct, updateProduct } = useStore();
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Chaniya Choli',
    price: '',
    originalPrice: '',
    allowCOD: true,
    image: '/images/products/product-1/main.jpg',
    images: '',
    description: '',
    originalSellerLink: '',
    colors: '',
    stockBySize: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 } as StockBySize
  });

  const [isUploading, setIsUploading] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        category: productToEdit.category,
        price: productToEdit.price.replace('₹', '').replace(',', ''),
        originalPrice: productToEdit.originalPrice ? productToEdit.originalPrice.replace('₹', '').replace(',', '') : '',
        allowCOD: productToEdit.allowCOD !== undefined ? productToEdit.allowCOD : true,
        image: productToEdit.image,
        images: productToEdit.images ? productToEdit.images.join(', ') : '',
        fabric: productToEdit.fabric || '',
        description: productToEdit.description || '',
        originalSellerLink: productToEdit.originalSellerLink || '',
        colors: productToEdit.colors ? productToEdit.colors.join(', ') : '',
        stockBySize: { ...productToEdit.stockBySize }
      });
    } else {
      setFormData({
        name: '',
        category: 'Chaniya Choli',
        price: '',
        originalPrice: '',
        allowCOD: true,
        image: '/images/products/product-1/main.jpg',
        images: '',
        fabric: '',
        description: '',
        originalSellerLink: '',
        colors: '',
        stockBySize: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
      });
    }
  }, [productToEdit, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    const filename = `product-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    formDataObj.append('filename', filename);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      });

      if (!res.ok) throw new Error('Upload failed');
      
      setFormData(prev => ({ ...prev, image: `/images/${filename}` }));
    } catch (err) {
      console.error(err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSizeChange = (size: keyof StockBySize, value: string) => {
    const num = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      stockBySize: {
        ...prev.stockBySize,
        [size]: num
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate total stock to determine status
    const totalStock = Object.values(formData.stockBySize).reduce((a, b) => a + b, 0);
    
    let status = 'Active';
    if (totalStock === 0) status = 'Out of Stock';
    else if (totalStock < 5) status = 'Low Stock';

    const productPayload: any = {
      name: formData.name,
      category: formData.category,
      price: `₹${parseInt(formData.price || '0').toLocaleString('en-IN')}`,
      originalPrice: formData.originalPrice ? `₹${parseInt(formData.originalPrice).toLocaleString('en-IN')}` : undefined,
      allowCOD: formData.allowCOD,
      stockBySize: formData.stockBySize,
      status,
      image: formData.image,
      images: formData.images.split(',').map(img => img.trim()).filter(img => img !== ''),
      fabric: formData.fabric,
      description: formData.description,
      originalSellerLink: formData.originalSellerLink,
      colors: formData.colors.split(',').map(c => c.trim()).filter(c => c !== '')
    };

    if (productToEdit) {
      await updateProduct(productToEdit.id, productPayload);
    } else {
      await addProduct(productPayload);
    }
    
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl border-l border-gray-200"
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{productToEdit ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Image Upload Area */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Product Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative overflow-hidden group">
                    {formData.image && formData.image !== '/images/products/product-1/main.jpg' ? (
                      <div className="w-full h-40 relative rounded-lg overflow-hidden mb-2">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm font-medium">Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded-lg flex flex-col items-center justify-center mb-2">
                        <span className="text-gray-400 mb-2">No image selected</span>
                        <span className="text-black text-sm font-medium underline">Click to upload</span>
                      </div>
                    )}
                    
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <span className="text-black font-medium text-sm animate-pulse">Uploading...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">Additional Images</label>
                  <textarea 
                    value={formData.images}
                    onChange={(e) => setFormData({...formData, images: e.target.value})}
                    placeholder="Enter image URLs separated by commas"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black resize-none"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">Example: /images/1.jpg, /images/2.jpg</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Product Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black"
                    >
                      <option>Chaniya Choli</option>
                      <option>Lehenga</option>
                      <option>Kurta Sets</option>
                      <option>Saree</option>
                      <option>Casual</option>
                      <option>Kids Wear</option>
                      <option>Accessories</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sale Price (₹)</label>
                    <input 
                      required
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Original Price (₹) [Optional]</label>
                    <input 
                      type="number" 
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black" 
                      placeholder="e.g. 5000"
                    />
                  </div>
                  
                  <div className="space-y-2 flex flex-col justify-center pt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.allowCOD}
                        onChange={(e) => setFormData({...formData, allowCOD: e.target.checked})}
                        className="w-5 h-5 accent-black rounded border-gray-300" 
                      />
                      <span className="text-sm font-medium text-gray-700">Allow Cash on Delivery (COD)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Fabric / Material</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Pure Silk & Georgette"
                    value={formData.fabric}
                    onChange={(e) => setFormData({...formData, fabric: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Colors (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Red, Blue, Green"
                    value={formData.colors}
                    onChange={(e) => setFormData({...formData, colors: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black resize-none" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 text-blue-600">Original Seller Link (Private)</label>
                  <input 
                    type="url"
                    placeholder="e.g. https://indiamart.com/... (Only visible to you)"
                    value={formData.originalSellerLink}
                    onChange={(e) => setFormData({...formData, originalSellerLink: e.target.value})}
                    className="w-full border border-blue-200 bg-blue-50/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                  <p className="text-xs text-gray-500 mt-1">This link is used for dropshipping. It will only be visible in the Admin Orders view.</p>
                </div>

                {/* Size-Level Stock Grid */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-700 block">Inventory by Size</label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.keys(formData.stockBySize).map((size) => (
                      <div key={size} className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 w-8 font-medium">{size}</span>
                        <input 
                          type="number" 
                          min="0"
                          value={formData.stockBySize[size as keyof StockBySize]}
                          onChange={(e) => handleSizeChange(size as keyof StockBySize, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-black focus:border-black text-sm" 
                        />
                      </div>
                    ))}
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="product-form"
                className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                {productToEdit ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
