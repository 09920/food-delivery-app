"use client";

import React, { useState, useEffect } from "react";
import { formatPaiseToRupees, formatDateTime } from "@/lib/formatters";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";
import {
  Bike,
  Power,
  MapPin,
  CheckCircle2,
  Navigation,
  KeyRound,
  AlertCircle,
  Phone,
  PackageCheck,
  Send,
  RefreshCw,
} from "lucide-react";

interface RiderActiveOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalPaise: number;
  deliveryAddressSnapshot: string;
  restaurant: { name: string; phone: string; address: string };
  customer: { name: string; phone: string };
  items: { nameSnapshot: string; quantity: number }[];
}

export default function RiderDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{
    isAvailable: boolean;
    vehicleType: string;
    licenseNumber: string;
    currentLatitude: number;
    currentLongitude: number;
  } | null>(null);

  const [activeOrders, setActiveOrders] = useState<RiderActiveOrder[]>([]);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [otpErrors, setOtpErrors] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingPing, setIsSendingPing] = useState(false);

  const fetchRiderData = async () => {
    try {
      const res = await fetch("/api/delivery/rider/status");
      const data = await res.json();
      if (data.profile) setProfile(data.profile);
      if (data.activeOrders) setActiveOrders(data.activeOrders);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRiderData();
    const interval = setInterval(fetchRiderData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    try {
      const nextStatus = !profile.isAvailable;
      const res = await fetch("/api/delivery/rider/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: nextStatus }),
      });
      const data = await res.json();
      if (data.profile) setProfile(data.profile);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateGpsPing = async () => {
    if (!profile) return;
    setIsSendingPing(true);
    try {
      // Simulate slight movement (+0.001 delta)
      const nextLat = profile.currentLatitude + (Math.random() - 0.5) * 0.002;
      const nextLng = profile.currentLongitude + (Math.random() - 0.5) * 0.002;

      await fetch("/api/delivery/rider/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: nextLat, longitude: nextLng }),
      });

      setProfile((prev) => (prev ? { ...prev, currentLatitude: nextLat, currentLongitude: nextLng } : null));
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingPing(false);
    }
  };

  const handlePickupOrder = async (orderId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus: "PICKED_UP",
          reason: "Rider Amit confirmed package pickup from restaurant",
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchRiderData();
      } else {
        alert(data.error || "Failed to confirm pickup");
      }
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteDeliveryWithOtp = async (orderId: string) => {
    const enteredOtp = otpInputs[orderId];
    if (!enteredOtp || enteredOtp.trim().length !== 4) {
      setOtpErrors((prev) => ({ ...prev, [orderId]: "Please enter the 4-digit OTP provided by customer" }));
      return;
    }

    setIsUpdating(true);
    setOtpErrors((prev) => ({ ...prev, [orderId]: "" }));

    try {
      const res = await fetch(`/api/orders/${orderId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus: "DELIVERED",
          verificationOtp: enteredOtp.trim(),
          reason: "Doorstep delivery verified via OTP",
        }),
      });

      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 70, spread: 60 });
        await fetchRiderData();
      } else {
        setOtpErrors((prev) => ({ ...prev, [orderId]: data.error || "Invalid OTP code" }));
      }
    } catch (err) {
      setOtpErrors((prev) => ({ ...prev, [orderId]: (err as Error).message }));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-blue-500/10 dark:bg-blue-950/20 border border-blue-300 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bike className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
              Delivery Partner Portal
            </h1>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Logged in as Rider: <span className="font-bold text-neutral-900 dark:text-neutral-100">{user?.name}</span> ({profile?.vehicleType || "MOTORCYCLE"})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleAvailability}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow ${
              profile?.isAvailable
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-neutral-600 hover:bg-neutral-700 text-white"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {profile?.isAvailable ? "Online (Accepting Trips)" : "Offline"}
          </button>

          <button
            onClick={handleSimulateGpsPing}
            disabled={isSendingPing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow"
          >
            <Send className="w-3.5 h-3.5" />
            {isSendingPing ? "Pinging..." : "Simulate GPS Ping"}
          </button>
        </div>
      </div>

      {/* GPS Location Status Ribbon */}
      {profile && (
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>
              Last GPS Coordinates: <strong className="text-neutral-900 dark:text-neutral-100">{profile.currentLatitude.toFixed(4)}, {profile.currentLongitude.toFixed(4)}</strong>
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Broadcasting via Redis / SSE
          </span>
        </div>
      )}

      {/* Active Deliveries Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <span>Active Assigned Trips</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            {activeOrders.length} active
          </span>
        </h2>

        {activeOrders.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800">
            <Bike className="w-10 h-10 mx-auto text-neutral-400 mb-2" />
            <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
              No active delivery trips assigned
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Stay online to receive automated proximity assignment offers from nearby restaurants.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeOrders.map((order) => {
              let addressObj: {
                addressLine?: string;
                city?: string;
                pincode?: string;
                deliveryInstructions?: string[];
              } = {};
              try {
                addressObj = JSON.parse(order.deliveryAddressSnapshot);
              } catch {}

              const isPickedUp = order.status === "PICKED_UP";

              return (
                <div
                  key={order.id}
                  className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border-2 border-blue-500/40 shadow-xl space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                        {order.orderNumber}
                      </span>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                        {order.restaurant.name}
                      </h3>
                    </div>
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-orange-100 text-orange-700 uppercase">
                      {order.status}
                    </span>
                  </div>

                  {/* Route Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Pickup Restaurant Card */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" /> 1. Pickup Restaurant
                        </span>
                        <a
                          href={`tel:${order.restaurant.phone}`}
                          className="text-[11px] font-bold text-amber-700 hover:underline"
                        >
                          Call Store
                        </a>
                      </div>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {order.restaurant.name}
                      </p>
                      <p className="text-neutral-500">{order.restaurant.address}</p>
                    </div>

                    {/* Drop Customer Card */}
                    <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-blue-600" /> 2. Customer Drop
                        </span>
                        <a
                          href={`tel:${order.customer.phone}`}
                          className="text-[11px] font-bold text-blue-700 hover:underline"
                        >
                          Call Customer
                        </a>
                      </div>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {order.customer.name}
                      </p>
                      <p className="text-neutral-500">
                        {addressObj.addressLine}, {addressObj.city} - {addressObj.pincode}
                      </p>
                      {addressObj.deliveryInstructions && addressObj.deliveryInstructions.length > 0 && (
                        <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/60">
                          <p className="text-[10px] font-bold text-blue-900 dark:text-blue-300 mb-1">
                            Customer Doorstep Instructions:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {addressObj.deliveryInstructions.map((inst) => (
                              <span
                                key={inst}
                                className="px-2 py-0.5 rounded-md bg-blue-200/80 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 text-[10px] font-black"
                              >
                                {inst}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dish checklist */}
                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 text-xs">
                    <p className="font-bold text-neutral-500 uppercase text-[10px] mb-1">
                      Order Items Checklist ({order.items.length})
                    </p>
                    <p className="text-neutral-800 dark:text-neutral-200">
                      {order.items.map((i) => `${i.quantity}x ${i.nameSnapshot}`).join(", ")}
                    </p>
                  </div>

                  {/* Operational State Progression */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    {!isPickedUp ? (
                      <button
                        onClick={() => handlePickupOrder(order.id)}
                        disabled={isUpdating}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Confirm Food Pickup from Kitchen</span>
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                          <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1 flex items-center gap-1.5">
                            <KeyRound className="w-4 h-4 text-orange-600" />
                            Customer Doorstep Delivery OTP Verification
                          </label>
                          <p className="text-[11px] text-neutral-500 mb-3">
                            Ask customer for the 4-digit code displayed on their tracking screen to complete delivery.
                          </p>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={4}
                              value={otpInputs[order.id] || ""}
                              onChange={(e) =>
                                setOtpInputs((prev) => ({ ...prev, [order.id]: e.target.value }))
                              }
                              placeholder="4-digit OTP"
                              className="px-4 py-2 text-sm font-mono tracking-widest text-center border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 w-36 font-black"
                            />

                            <button
                              onClick={() => handleCompleteDeliveryWithOtp(order.id)}
                              disabled={isUpdating}
                              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verify & Complete Delivery</span>
                            </button>
                          </div>

                          {otpErrors[order.id] && (
                            <p className="text-xs text-red-500 font-semibold mt-2 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {otpErrors[order.id]}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
