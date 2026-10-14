'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function StoreInitializer() {
  const { fetchProducts, detectUserCountry, fetchSettings } = useStore();

  useEffect(() => {
    fetchProducts();
    detectUserCountry();
    fetchSettings();
  }, [fetchProducts, detectUserCountry, fetchSettings]);

  return null;
}
