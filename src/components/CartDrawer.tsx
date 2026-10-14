"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPaiseToRupees } from "@/lib/formatters";
import {
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    restaurantName,
    items,
    pricing,
    isLoadingPricing,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState("");
  const [couponError, setCouponError] = useState("");

  if (!isOpen) return null;

  const handleApplyCoupon = async (codeToApply?: string) => {
    setCouponError("");
    const targetCode = codeToApply || inputCoupon;
    if (!targetCode) return;
    const success = await applyCoupon(targetCode);
    if (!success) {
      setCouponError("Invalid coupon or minimum order value not met");
    } else {
      setInputCoupon("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 pointer-events-none">
        <div className="w-full sm:w-[440px] max-w-full bg-white dark:bg-neutral-900 shadow-2xl flex flex-col pointer-events-auto h-full">
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                Your Cart
              </h2>
              {restaurantName && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Ordering from: <span className="font-semibold text-neutral-700 dark:text-neutral-200">{restaurantName}</span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-orange-500 mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Your cart is empty
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  Explore delicious dishes from our curated restaurant menus and add your favorites!
                </p>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {items.map((item) => (
                    <div key={item.menuItemId} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Veg / Non-veg indicator dot */}
                        <div
                          className={`w-3.5 h-3.5 flex-shrink-0 rounded border flex items-center justify-center ${
                            item.isVegetarian ? "border-green-600" : "border-red-600"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isVegetarian ? "bg-green-600" : "bg-red-600"
                            }`}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {formatPaiseToRupees(item.pricePaise)}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                          <button
                            onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                            className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-l transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                            className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-r transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-xs font-bold w-16 text-right text-neutral-900 dark:text-neutral-100">
                          {formatPaiseToRupees(item.pricePaise * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Section */}
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-orange-500" />
                    Offers & Promotional Coupons
                  </label>

                  {pricing?.appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                            '{pricing.appliedCoupon.code}' Applied!
                          </p>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                            You saved {formatPaiseToRupees(pricing.appliedCoupon.discountPaise)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputCoupon}
                          onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code (e.g. FIRST50)"
                          className="flex-1 px-3 py-2 text-xs border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                        />
                        <button
                          onClick={() => handleApplyCoupon()}
                          className="px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
                        >
                          Apply
                        </button>
                      </div>

                      {couponError && (
                        <p className="text-xs text-red-500">{couponError}</p>
                      )}

                      {/* Quick Coupon Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {["FIRST50", "ROYALFEAST", "FREEDEL"].map((code) => (
                          <button
                            key={code}
                            onClick={() => handleApplyCoupon(code)}
                            className="px-2 py-1 text-[11px] font-semibold bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 transition-colors"
                          >
                            + {code}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bill Breakdown */}
                {pricing && (
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-2.5 text-xs">
                    <p className="font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide text-[10px]">
                      Bill Details
                    </p>
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Item Subtotal</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {formatPaiseToRupees(pricing.subtotalPaise)}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Taxes & Restaurant GST (5%)</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {formatPaiseToRupees(pricing.taxPaise)}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Delivery Partner Fee</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {formatPaiseToRupees(pricing.deliveryFeePaise)}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Platform Fee</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {formatPaiseToRupees(pricing.platformFeePaise)}
                      </span>
                    </div>
                    {pricing.discountPaise > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Promotional Discount</span>
                        <span>-{formatPaiseToRupees(pricing.discountPaise)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-between text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      <span>To Pay</span>
                      <span className="text-base text-orange-600">
                        {formatPaiseToRupees(pricing.totalPaise)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Checkout Actions */}
          {items.length > 0 && pricing && (
            <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all group"
              >
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-orange-100 font-medium">
                    Total Payable
                  </p>
                  <p className="text-lg leading-tight font-black">
                    {formatPaiseToRupees(pricing.totalPaise)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
