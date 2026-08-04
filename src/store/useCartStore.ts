import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  sellerId: string;
  sellerName: string;
  title: string;
  slug: string;
  price: number;
  image: string;
  type: 'physical_unique' | 'physical_multiple' | 'digital' | 'physical';
  quantity: number;
  stock: number;
  isPhysicalPrint?: boolean;
  physicalPrintPrice?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getUniquePhysicalSellersCount: () => number;
  getShippingFee: (deliveryMethod?: string) => number;
  getTotalAmount: (deliveryMethod?: string) => number;
  getTotalItems: () => number;
}

export const SHIPPING_FEE_PER_SELLER = 3.5;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        const existing = items.find(i => i.productId === item.productId && i.isPhysicalPrint === item.isPhysicalPrint);

        if (existing) {
          if (item.type === 'physical_unique') return false;
          if (existing.quantity >= item.stock) return false;
          set({
            items: items.map(i =>
              i.productId === item.productId && i.isPhysicalPrint === item.isPhysicalPrint ? { ...i, quantity: i.quantity + 1 } : i
            )
          });
          return true;
        }

        set({ items: [...items, { ...item, quantity: 1 }] });
        return true;
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map(i => {
            if (i.productId === productId) {
              const max = i.type === 'physical_unique' ? 1 : i.stock;
              return { ...i, quantity: Math.min(quantity, max) };
            }
            return i;
          })
        });
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const unit = item.price + (item.isPhysicalPrint ? (item.physicalPrintPrice || 0) : 0);
          return total + unit * item.quantity;
        }, 0);
      },

      getUniquePhysicalSellersCount: () => {
        const physicalItems = get().items.filter(i => i.type !== 'digital' || i.isPhysicalPrint);
        const sellerIds = new Set(physicalItems.map(i => i.sellerId));
        return sellerIds.size;
      },

      getShippingFee: (deliveryMethod = 'cafe_pickup') => {
        if (deliveryMethod !== 'shipping') return 0;
        const sellersCount = get().getUniquePhysicalSellersCount();
        return sellersCount * SHIPPING_FEE_PER_SELLER;
      },

      getTotalAmount: (deliveryMethod = 'cafe_pickup') => {
        return get().getSubtotal() + get().getShippingFee(deliveryMethod);
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      }
    }),
    { name: 'coisart-cart' }
  )
);
