"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPaiseToRupees } from "@/lib/formatters";
import confetti from "canvas-confetti";
import {
  MapPin,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Lock,
  Trash2,
} from "lucide-react";

interface SavedAddress {
  id: string;
  label: string;
  addressLine: string;
  landmark?: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { restaurantId, restaurantName, items, couponCode, pricing, clearCart } = useCart();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAddingNewAddr, setIsAddingNewAddr] = useState(false);

  const toggleInstruction = (instruction: string) => {
    setSelectedInstructions((prev) =>
      prev.includes(instruction)
        ? prev.filter((i) => i !== instruction)
        : [...prev, instruction]
    );
  };

  // New address form state
  const [newLabel, setNewLabel] = useState("Home");
  const [newAddressLine, setNewAddressLine] = useState("");
  const [newLandmark, setNewLandmark] = useState("");
  const [newPincode, setNewPincode] = useState("400050");

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/customer/addresses");
      const data = await res.json();
      if (data.addresses && data.addresses.length > 0) {
        setAddresses(data.addresses);
        const defaultAddr = data.addresses.find((a: SavedAddress) => a.isDefault);
        setSelectedAddressId(defaultAddr ? defaultAddr.id : data.addresses[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLine || !newPincode) return;

    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newLabel,
          addressLine: newAddressLine,
          landmark: newLandmark,
          city: "Mumbai",
          pincode: newPincode,
          isDefault: true,
        }),
      });
      const data = await res.json();
      if (data.address) {
        setAddresses((prev) => [data.address, ...prev]);
        setSelectedAddressId(data.address.id);
        setIsAddingNewAddr(false);
        setNewAddressLine("");
        setNewLandmark("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (e: React.MouseEvent, addressId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await fetch(`/api/customer/addresses?id=${encodeURIComponent(addressId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAddresses((prev) => {
          const updated = prev.filter((a) => a.id !== addressId);
          if (selectedAddressId === addressId) {
            setSelectedAddressId(updated.length > 0 ? updated[0].id : "");
          }
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      setErrorMsg("Please sign in with your email to place this order.");
      return;
    }

    if (!selectedAddressId || !restaurantId || items.length === 0 || !pricing) {
      setErrorMsg("Please select a delivery address and confirm your cart items.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Create order on server
      const idempotencyKey = `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
          addressId: selectedAddressId,
          couponCode,
          idempotencyKey,
          deliveryInstructions: selectedInstructions,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.order) {
        throw new Error(orderData.error || "Failed to place order");
      }

      const createdOrder = orderData.order;
      const paymentOrder = orderData.payment;

      // 2. Complete payment verification (simulated test-mode signature)
      const simPaymentId = `pay_rzp_${Date.now()}`;
      const simSignature = `sim_sig_${Date.now()}`;

      const verifyRes = await fetch("/api/payments/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: createdOrder.id,
          razorpayOrderId: paymentOrder.gatewayOrderId,
          razorpayPaymentId: simPaymentId,
          razorpaySignature: simSignature,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Payment verification failed");
      }

      // 3. Clear cart & trigger celebratory confetti
      clearCart();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // 4. Redirect to Order Tracking screen
      router.push(`/orders/${createdOrder.id}`);
    } catch (err) {
      setErrorMsg((err as Error).message);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="text-xs text-neutral-500 mt-2">Add items to your cart before proceeding to checkout.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-100">Checkout & Payment</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Review your delivery address, items, and complete secure payment.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Address & Payment Method */}
        <div className="md:col-span-2 space-y-6">
          {/* Sign In Required Notice (Swiggy / Zomato workflow) */}
          {!user && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 border border-orange-200 dark:border-orange-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-500" />
                  Account Authentication Required
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Log in or create an account with your email to track your order live and confirm delivery.
                </p>
              </div>
              <Link
                href="/login"
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Sign In with Email</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Section 1: Delivery Address */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                Select Delivery Address
              </h2>
              <button
                onClick={() => setIsAddingNewAddr(!isAddingNewAddr)}
                className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {isAddingNewAddr ? "Cancel" : "Add New"}
              </button>
            </div>

            {isAddingNewAddr && (
              <form onSubmit={handleAddNewAddress} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-500">Address Label</label>
                    <select
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-xs border rounded-xl bg-white dark:bg-neutral-900"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-500">Pincode</label>
                    <input
                      type="text"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-xs border rounded-xl bg-white dark:bg-neutral-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-500">Address Details</label>
                  <input
                    type="text"
                    required
                    value={newAddressLine}
                    onChange={(e) => setNewAddressLine(e.target.value)}
                    placeholder="Flat/House no., Building name, Street"
                    className="w-full mt-1 px-3 py-2 text-xs border rounded-xl bg-white dark:bg-neutral-900"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors"
                >
                  Save & Use Address
                </button>
              </form>
            )}

            <div className="space-y-2.5">
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <label
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 shadow-sm"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 text-orange-600 focus:ring-orange-500"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                            {addr.addressLine}, {addr.city} - {addr.pincode}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteAddress(e, addr.id)}
                        className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors ml-2"
                        title="Delete address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Delivery Instructions for Partner */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>📦</span> Delivery Instructions for Partner
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Select doorstep preferences for your rider
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {[
                { id: "Leave at door", label: "Leave at door / gate", icon: "🚪" },
                { id: "Don't ring bell", label: "Don't ring bell (sleeping)", icon: "🔕" },
                { id: "Avoid calling", label: "Avoid phone calls", icon: "📵" },
                { id: "Pet at home", label: "Pet at home (take care)", icon: "🐕" },
              ].map((opt) => {
                const isChecked = selectedInstructions.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleInstruction(opt.id)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isChecked
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-950 dark:text-orange-200 shadow-xs ring-1 ring-orange-500/30"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    <span className="text-xl mb-1.5">{opt.icon}</span>
                    <span className="text-xs font-bold leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-500" />
              Payment Method
            </h2>

            <div className="p-4 rounded-2xl border-2 border-orange-500 bg-orange-50/30 dark:bg-orange-950/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-md">
                  RZP
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Razorpay Gateway (UPI, Cards, NetBanking)
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Secure 256-bit encrypted test mode transaction
                  </p>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Pay Button */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Order Summary
            </h2>
            <p className="text-xs text-neutral-500">
              From: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{restaurantName}</span>
            </p>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.menuItemId} className="py-2.5 flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      {item.quantity}x
                    </span>{" "}
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatPaiseToRupees(item.pricePaise * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill summary */}
            {pricing && (
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span>{formatPaiseToRupees(pricing.subtotalPaise)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>GST (5%)</span>
                  <span>{formatPaiseToRupees(pricing.taxPaise)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Delivery Fee</span>
                  <span>{formatPaiseToRupees(pricing.deliveryFeePaise)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Platform Fee</span>
                  <span>{formatPaiseToRupees(pricing.platformFeePaise)}</span>
                </div>
                {pricing.discountPaise > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount ({pricing.appliedCoupon?.code})</span>
                    <span>-{formatPaiseToRupees(pricing.discountPaise)}</span>
                  </div>
                )}
                <div className="pt-2 border-t flex justify-between text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
                  <span>Total Amount</span>
                  <span className="text-orange-600">
                    {formatPaiseToRupees(pricing.totalPaise)}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || !selectedAddressId}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Processing Order & Payment..."
                  : `Pay ${pricing ? formatPaiseToRupees(pricing.totalPaise) : ""}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
