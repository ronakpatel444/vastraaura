'use client';

import { useState, useEffect } from 'react';
import { Upload, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

// The images we want to make editable
const contentImages = [
  { id: 'hero', title: 'Main Hero Image', path: '/images/hero.jpg', description: 'The large image seen at the very top of the homepage.' },
  { id: 'edit-1', title: 'Editorial 1 (Horizontal)', path: '/images/edit-1.jpg', description: 'First image in the horizontal scrolling section.' },
  { id: 'edit-2', title: 'Editorial 2 (Horizontal)', path: '/images/edit-2.jpg', description: 'Second image in the horizontal scrolling section.' },
  { id: 'edit-3', title: 'Editorial 3 (Horizontal)', path: '/images/edit-3.jpg', description: 'Third image in the horizontal scrolling section.' },
  { id: 'edit-4', title: 'Editorial 4 (Horizontal)', path: '/images/edit-4.jpg', description: 'Fourth image in the horizontal scrolling section.' },
  { id: 'edit-5', title: 'Editorial 5 (Horizontal)', path: '/images/edit-5.jpg', description: 'Fifth image in the horizontal scrolling section.' },
];

export default function AdminContentPage() {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  // Use empty string initially to prevent hydration mismatch, set actual timestamp on client mount
  const [cacheBuster, setCacheBuster] = useState('');

  useEffect(() => {
    setCacheBuster(Date.now().toString());
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageId: string, filename: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(imageId);
    setSuccessId(null);
    setErrorId(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', filename); // e.g. "hero.jpg"

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      
      setSuccessId(imageId);
      setCacheBuster(Date.now().toString()); // Force refresh images
      setTimeout(() => setSuccessId(null), 3000);
    } catch (err) {
      console.error(err);
      setErrorId(imageId);
      setTimeout(() => setErrorId(null), 3000);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="p-10 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Content</h1>
        <p className="text-gray-500">Manage the main visual assets for the storefront.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {contentImages.map((img) => (
          <div key={img.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
            {/* Image Preview */}
            <div className="w-full h-48 bg-gray-100 relative group border-b border-gray-100">
              <img 
                src={`${img.path}${cacheBuster ? `?t=${cacheBuster}` : ''}`} 
                alt={img.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg">
                  <Upload className="w-4 h-4" /> 
                  Upload New Photo
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/webp" 
                    className="hidden" 
                    onChange={(e) => handleUpload(e, img.id, img.path.replace('/images/', ''))}
                    disabled={uploadingId === img.id}
                  />
                </label>
              </div>
              
              {/* Status Indicators */}
              {uploadingId === img.id && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-black mb-2" />
                  <span className="text-sm font-medium">Uploading...</span>
                </div>
              )}
              {successId === img.id && (
                <div className="absolute inset-0 bg-green-500/90 flex flex-col items-center justify-center text-white">
                  <CheckCircle2 className="w-10 h-10 mb-2" />
                  <span className="text-sm font-medium">Updated Successfully!</span>
                </div>
              )}
              {errorId === img.id && (
                <div className="absolute inset-0 bg-red-500/90 flex flex-col items-center justify-center text-white">
                  <AlertCircle className="w-10 h-10 mb-2" />
                  <span className="text-sm font-medium">Upload Failed</span>
                </div>
              )}
            </div>
            
            {/* Details */}
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-gray-900 mb-1">{img.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{img.description}</p>
              
              <div className="mt-auto flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 pt-3">
                <span>File: {img.path.replace('/images/', '')}</span>
                <span>Recommended: 1920x1080 (Hero), 800x1200 (Horizontal)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
