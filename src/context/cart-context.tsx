"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  id: string; // Typically variantId
  variantId: string;
  productId?: string;
  title: string;
  variantTitle?: string;
  price: number;
  currencyCode: string;
  quantity: number;
  image?: string | null;
  handle?: string;
};

type CartContextType = {
  items: CartItem[];
  isOpen: boolean;
  totalQuantity: number;
  subtotal: number;
  currencyCode: string;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (
    item: {
      variantId: string;
      productId?: string;
      title: string;
      variantTitle?: string;
      price: number;
      currencyCode?: string;
      image?: string | null;
      handle?: string;
    },
    quantity?: number,
  ) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  checkout: () => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "aftr_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore storage read errors
    } finally {
      setHasLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write errors
    }
  }, [items, hasLoaded]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addItem = (
    itemData: {
      variantId: string;
      productId?: string;
      title: string;
      variantTitle?: string;
      price: number;
      currencyCode?: string;
      image?: string | null;
      handle?: string;
    },
    quantity = 1,
  ) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.variantId === itemData.variantId,
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      const newItem: CartItem = {
        id: itemData.variantId,
        variantId: itemData.variantId,
        productId: itemData.productId,
        title: itemData.title,
        variantTitle: itemData.variantTitle,
        price: itemData.price,
        currencyCode: itemData.currencyCode || "USD",
        quantity,
        image: itemData.image,
        handle: itemData.handle,
      };

      return [...prevItems, newItem];
    });

    setIsOpen(true);
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.variantId === variantId ? { ...item, quantity } : item,
      ),
    );
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const currencyCode = items[0]?.currencyCode || "USD";

  const checkout = async () => {
    if (items.length === 0 || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: items.map((item) => ({
            merchandiseId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok && data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }

      // If backend returned a fallback permalink, use it
      if (data.fallbackUrl) {
        window.location.assign(data.fallbackUrl);
        return;
      }

      throw new Error(data.error || "Unable to open checkout.");
    } catch (err) {
      // Fallback direct Shopify checkout link
      const domain =
        process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "dermk0-70.myshopify.com";
      const permalinkParts = items
        .map((i) => {
          const numId = i.variantId.replace(/\D/g, "");
          return numId ? `${numId}:${i.quantity}` : null;
        })
        .filter(Boolean);

      if (permalinkParts.length > 0) {
        const directUrl = `https://${domain}/cart/${permalinkParts.join(",")}`;
        window.location.assign(directUrl);
      } else {
        alert(
          err instanceof Error
            ? err.message
            : "Checkout is currently unavailable. Please verify your Shopify store configuration.",
        );
        setIsLoading(false);
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        totalQuantity,
        subtotal,
        currencyCode,
        isLoading,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
