import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  stock: number;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        set((state) => {
          if (!state.items.find((i) => i._id === item._id)) {
            return { items: [...state.items, item] };
          }
          return state;
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i._id !== id)
        }));
      },
      
      isInWishlist: (id) => {
        return get().items.some((i) => i._id === id);
      },
      
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'arj-wishlist-storage',
    }
  )
);
