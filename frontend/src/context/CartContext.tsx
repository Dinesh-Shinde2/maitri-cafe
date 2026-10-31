import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  is_veg: boolean;
  notes?: string;
}

interface CartContextType {
  cart: CartItem[];
  tableNumber: string | null;
  qrToken: string | null;
  setTableSession: (tableNumber: string, token: string) => void;
  clearTableSession: () => void;
  addToCart: (item: any) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('maitri_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [tableNumber, setTableNumber] = useState<string | null>(() => localStorage.getItem('maitri_table_num'));
  const [qrToken, setQrToken] = useState<string | null>(() => localStorage.getItem('maitri_qr_token'));

  useEffect(() => {
    localStorage.setItem('maitri_cart', JSON.stringify(cart));
  }, [cart]);

  const setTableSession = useCallback((num: string, token: string) => {
    setTableNumber(num);
    setQrToken(token);
    localStorage.setItem('maitri_table_num', num);
    localStorage.setItem('maitri_qr_token', token);
  }, []);

  const clearTableSession = useCallback(() => {
    setTableNumber(null);
    setQrToken(null);
    localStorage.removeItem('maitri_table_num');
    localStorage.removeItem('maitri_qr_token');
  }, []);

  const addToCart = useCallback((item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, is_veg: item.is_veg }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: number) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== itemId));
      return;
    }
    setCart((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        tableNumber,
        qrToken,
        setTableSession,
        clearTableSession,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
