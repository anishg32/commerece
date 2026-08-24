import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  brand: string;
  stock: number;
  variant?: {
    color?: string;
    size?: string;
  };
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((i) => i._id === item._id);
          
          if (existingItem) {
            // Update quantity, maxing out at available stock
            const newQuantity = Math.min(existingItem.quantity + quantity, item.stock);
            return {
              items: state.items.map((i) => 
                i._id === item._id ? { ...i, quantity: newQuantity } : i
              )
            };
          }
          
          return { items: [...state.items, { ...item, quantity: Math.min(quantity, item.stock) }] };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i._id !== id)
        }));
      },
      
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((i) => {
            if (i._id === id) {
              return { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) };
            }
            return i;
          })
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'arj-cart-storage',
      skipHydration: true,
    }
  )
);
