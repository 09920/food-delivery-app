"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItemType {
  menuItemId: string;
  name: string;
  pricePaise: number;
  quantity: number;
  isVegetarian: boolean;
  imageUrl?: string;
}

export interface PricingState {
  subtotalPaise: number;
  taxPaise: number;
  deliveryFeePaise: number;
  platformFeePaise: number;
  discountPaise: number;
  totalPaise: number;
  appliedCoupon?: {
    code: string;
    discountPaise: number;
    description: string;
  } | null;
}

interface CartContextType {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItemType[];
  couponCode: string;
  pricing: PricingState | null;
  isLoadingPricing: boolean;
  addToCart: (
    item: { id: string; name: string; pricePaise: number; isVegetarian: boolean; imageUrl?: string },
    restaurant: { id: string; name: string }
  ) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [items, setItems] = useState<CartItemType[]>([]);
  const [couponCode, setCouponCode] = useState<string>("");
  const [pricing, setPricing] = useState<PricingState | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ofds_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        setRestaurantId(parsed.restaurantId || null);
        setRestaurantName(parsed.restaurantName || null);
        setItems(parsed.items || []);
        setCouponCode(parsed.couponCode || "");
      }
    } catch (e) {
      console.error("Cart localStorage error:", e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "ofds_cart",
        JSON.stringify({ restaurantId, restaurantName, items, couponCode })
      );
    } catch (e) {
      console.error("Cart saving error:", e);
    }
  }, [restaurantId, restaurantName, items, couponCode]);

  // Recalculate server pricing when items or coupon change
  useEffect(() => {
    if (!restaurantId || items.length === 0) {
      setPricing(null);
      return;
    }

    let isSubscribed = true;
    setIsLoadingPricing(true);

    fetch("/api/cart/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId,
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        couponCode,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isSubscribed && data.pricing) {
          setPricing(data.pricing);
        }
      })
      .catch((err) => console.error("Pricing recalculation error:", err))
      .finally(() => {
        if (isSubscribed) setIsLoadingPricing(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [restaurantId, items, couponCode]);

  const addToCart = (
    item: { id: string; name: string; pricePaise: number; isVegetarian: boolean; imageUrl?: string },
    restaurant: { id: string; name: string }
  ) => {
    // If cart has items from another restaurant, confirm reset
    if (restaurantId && restaurantId !== restaurant.id && items.length > 0) {
      if (
        !window.confirm(
          `Your cart contains items from ${restaurantName}. Would you like to clear your cart and start a fresh order from ${restaurant.name}?`
        )
      ) {
        return;
      }
      setItems([
        {
          menuItemId: item.id,
          name: item.name,
          pricePaise: item.pricePaise,
          quantity: 1,
          isVegetarian: item.isVegetarian,
          imageUrl: item.imageUrl,
        },
      ]);
      setRestaurantId(restaurant.id);
      setRestaurantName(restaurant.name);
      return;
    }

    setRestaurantId(restaurant.id);
    setRestaurantName(restaurant.name);

    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          pricePaise: item.pricePaise,
          quantity: 1,
          isVegetarian: item.isVegetarian,
          imageUrl: item.imageUrl,
        },
      ];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.menuItemId !== menuItemId);
      if (filtered.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
      }
      return filtered;
    });
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    setCouponCode("");
    setPricing(null);
    localStorage.removeItem("ofds_cart");
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!restaurantId || items.length === 0) return false;
    try {
      const res = await fetch("/api/cart/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
          couponCode: code,
        }),
      });
      const data = await res.json();
      if (data.pricing?.appliedCoupon) {
        setCouponCode(code);
        setPricing(data.pricing);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
  };

  return (
    <CartContext.Provider
      value={{
        restaurantId,
        restaurantName,
        items,
        couponCode,
        pricing,
        isLoadingPricing,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
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
