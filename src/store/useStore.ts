import { create } from 'zustand';

type CursorType = 'DEFAULT' | 'VIEW' | 'DRAG' | 'MAGNETIC';

export interface CartItem {
  id: string | number;
  name: string;
  price: string;
  originalPrice?: string;
  allowCOD?: boolean;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  originalSellerLink?: string;
  category?: string;
}

export interface ProductSize {
  name: string;
  stock: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  image: string;
  images?: string[];
  category: string;
  price: string;
  originalPrice?: string;
  allowCOD: boolean;
  sizes: ProductSize[];
  status: string;
  fabric: string;
  description: string;
  originalSellerLink?: string;
  colors: string[];
  colorDetails?: { name: string; image: string }[];
}

export interface AdminCoupon {
  id: string;
  code: string;
  discountPercent: number;
  applicableProductIds: string[];
  isActive: boolean;
}

export interface AdminReview {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface StoreState {
  cursorType: CursorType;
  setCursorType: (type: CursorType) => void;
  
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
  
  isMenuOpen: boolean;
  setMenuOpen: (isOpen: boolean) => void;
  
  isSearchOpen: boolean;
  setSearchOpen: (isOpen: boolean) => void;

  cartItems: CartItem[];
  appliedCoupon: AdminCoupon | null;
  setAppliedCoupon: (coupon: AdminCoupon | null) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number, size?: string, color?: string) => void;
  updateQuantity: (id: string | number, size: string | undefined, color: string | undefined, quantity: number) => void;
  getCartTotal: () => number;
  getComboDiscount: () => number;

  // Admin State
  adminProducts: AdminProduct[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: AdminProduct) => void;
  updateProduct: (id: string, product: AdminProduct) => void;
  deleteProduct: (id: string) => void;

  adminCoupons: AdminCoupon[];
  fetchCoupons: () => Promise<void>;
  addCoupon: (coupon: Omit<AdminCoupon, 'id'>) => Promise<boolean>;
  deleteCoupon: (id: string) => Promise<void>;

  adminOrders: any[];
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;

  adminReviews: AdminReview[];
  fetchReviews: () => Promise<void>;
  submitReview: (review: Omit<AdminReview, 'id' | 'createdAt'>) => Promise<boolean>;

  storeSettings: any;
  fetchSettings: () => Promise<void>;
}

export const useStore = create<StoreState>((set) => ({
  cursorType: 'DEFAULT',
  setCursorType: (type) => set({ cursorType: type }),
  
  isCartOpen: false,
  setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  
  isMenuOpen: false,
  setMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),
  
  isSearchOpen: false,
  setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),

  cartItems: [],
  appliedCoupon: null,
  setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
  addToCart: (item) => set((state) => {
    const existingIndex = state.cartItems.findIndex(i => i.id === item.id && i.size === item.size && i.color === item.color);
    if (existingIndex >= 0) {
      const newItems = [...state.cartItems];
      newItems[existingIndex].quantity += item.quantity;
      return { cartItems: newItems, isCartOpen: true };
    }
    return { cartItems: [...state.cartItems, { ...item, originalSellerLink: item.originalSellerLink, category: item.category }], isCartOpen: true };
  }),
  removeFromCart: (id, size, color) => set((state) => ({
    cartItems: state.cartItems.filter(i => 
      !(String(i.id) === String(id) && i.size === size && i.color === color)
    )
  })),
  updateQuantity: (id, size, color, quantity) => set((state) => ({
    cartItems: state.cartItems.map(i => 
      (String(i.id) === String(id) && i.size === size && i.color === color) ? { ...i, quantity } : i
    )
  })),
  getCartTotal: () => {
    const state = useStore.getState();
    let total = 0;
    
    // Combo Logic arrays
    const comboItemPrices: number[] = [];
    
    state.cartItems.forEach(item => {
        const priceVal = parseInt(item.price.replace(/[^\d]/g, ''), 10);
        // If it's a combo eligible item (from the Combo category)
        if (item.category === 'Combo') {
            for (let i = 0; i < item.quantity; i++) {
                comboItemPrices.push(priceVal);
            }
        } else {
            total += priceVal * item.quantity;
        }
    });

    // Handle Combo pricing: 2 for 2999
    // Sort descending so most expensive items get paired first to maximize discount
    comboItemPrices.sort((a, b) => b - a);
    
    const comboPairs = Math.floor(comboItemPrices.length / 2);
    const remainder = comboItemPrices.length % 2;
    
    total += comboPairs * 2999;
    
    if (remainder > 0) {
        // Add the remaining unpaired item (the cheapest one) at its regular price
        total += comboItemPrices[comboItemPrices.length - 1];
    }
    
    return total;
  },
  getComboDiscount: () => {
    const state = useStore.getState();
    let discount = 0;
    const comboItemPrices: number[] = [];
    
    state.cartItems.forEach(item => {
        if (item.category === 'Combo') {
            const priceVal = parseInt(item.price.replace(/[^\d]/g, ''), 10);
            for (let i = 0; i < item.quantity; i++) {
                comboItemPrices.push(priceVal);
            }
        }
    });

    comboItemPrices.sort((a, b) => b - a);
    const comboPairs = Math.floor(comboItemPrices.length / 2);
    
    // For every pair, the regular cost would be the sum of those two items.
    // The combo cost is 2999.
    // The discount is the difference.
    for (let i = 0; i < comboPairs; i++) {
        const item1Price = comboItemPrices[i * 2];
        const item2Price = comboItemPrices[i * 2 + 1];
        const regularPairPrice = item1Price + item2Price;
        if (regularPairPrice > 2999) {
            discount += (regularPairPrice - 2999);
        }
    }
    
    return discount;
  },

  // Admin State Implementation
  adminProducts: [],
  
  fetchProducts: async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) {
        console.error(`Failed to fetch products: ${res.status} ${res.statusText}`);
        return;
      }
      
      const text = await res.text();
      if (!text) return;
      
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          const mappedProducts = data.map((p: any) => ({
            ...p,
            id: p._id,
          }));
          set({ adminProducts: mappedProducts });
        }
      } catch (e) {
        console.error('Invalid JSON from /api/products:', text.substring(0, 100));
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  },

  addProduct: async (product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (res.ok) {
        set((state) => ({
          adminProducts: [{ ...data, id: data._id }, ...state.adminProducts]
        }));
      }
    } catch (err) {
      console.error('Failed to add product', err);
    }
  },
  
  updateProduct: async (id, updatedProduct) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      const data = await res.json();
      if (res.ok) {
        set((state) => ({
          adminProducts: state.adminProducts.map(p => p.id === id ? { ...data, id: data._id } : p)
        }));
      }
    } catch (err) {
      console.error('Failed to update product', err);
    }
  },
  
  deleteProduct: async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        set((state) => ({
          adminProducts: state.adminProducts.filter(p => p.id !== id)
        }));
      }
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  },

  adminCoupons: [],
  fetchCoupons: async () => {
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      if (Array.isArray(data)) {
        const mappedCoupons = data.map((c: any) => ({ ...c, id: c._id }));
        set({ adminCoupons: mappedCoupons });
      }
    } catch (err) {
      console.error('Failed to fetch coupons', err);
    }
  },
  addCoupon: async (coupon) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon),
      });
      if (res.ok) {
        const data = await res.json();
        set((state) => ({
          adminCoupons: [{ ...data, id: data._id }, ...state.adminCoupons]
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to add coupon', err);
      return false;
    }
  },
  deleteCoupon: async (id) => {
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set((state) => ({
          adminCoupons: state.adminCoupons.filter(c => c.id !== id)
        }));
      }
    } catch (err) {
      console.error('Failed to delete coupon', err);
    }
  },

  adminOrders: [],
  fetchOrders: async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        set({ adminOrders: data });
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  },
  updateOrderStatus: async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        set((state) => ({
          adminOrders: state.adminOrders.map(order => 
            order._id === id ? { ...order, status } : order
          )
        }));
      }
    } catch (err) {
      console.error('Failed to update order status', err);
    }
  },

  adminReviews: [],
  fetchReviews: async () => {
    try {
      const res = await fetch('/api/reviews', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((r: any) => ({ ...r, id: r._id }));
        set({ adminReviews: mapped });
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  },
  submitReview: async (review) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      if (res.ok) {
        const data = await res.json();
        set((state) => ({
          adminReviews: [{ ...data, id: data._id }, ...state.adminReviews]
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to submit review', err);
      return false;
    }
  },

  storeSettings: null,
  fetchSettings: async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        set({ storeSettings: data });
      }
    } catch (err) {
      console.error('Failed to fetch store settings', err);
    }
  }
}));
