'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function StoreInitializer() {
  const { fetchProducts } = useStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return null;
}
