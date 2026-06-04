import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { addToCart, getCart } from "../api/client";
import type { Cart } from "../types/api";

const CART_ID_KEY = "uniblox_cart_id";

const emptyCart = (cartId: string): Cart => ({
  id: cartId,
  items: [],
  subtotal: 0,
  updatedAt: new Date().toISOString(),
});

interface CartContextValue {
  cartId: string;
  cart: Cart;
  itemCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const getOrCreateCartId = (): string => {
  const existing = localStorage.getItem(CART_ID_KEY);
  if (existing) {
    return existing;
  }
  const cartId = `cart_${crypto.randomUUID().slice(0, 8)}`;
  localStorage.setItem(CART_ID_KEY, cartId);
  return cartId;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const cartId = useMemo(() => getOrCreateCartId(), []);
  const [cart, setCart] = useState<Cart>(emptyCart(cartId));
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const latest = await getCart(cartId);
      setCart(latest);
    } finally {
      setLoading(false);
    }
  }, [cartId]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      const updated = await addToCart(cartId, productId, quantity);
      setCart(updated);
    },
    [cartId],
  );

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextValue = {
    cartId,
    cart,
    itemCount,
    loading,
    refreshCart,
    addItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
