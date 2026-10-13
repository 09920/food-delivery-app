"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatPaiseToRupees, formatDateTime } from "@/lib/formatters";
import { useAuth } from "@/context/AuthContext";
import {
  CheckCircle2,
  Clock,
  Bike,
  ShieldCheck,
  MapPin,
  Phone,
  KeyRound,
  Star,
  AlertTriangle,
  ArrowLeft,
  LifeBuoy,
  RefreshCw,
  Sparkles,
  FileText,
  Printer,
} from "lucide-react";
import LiveGpsMap from "@/components/LiveGpsMap";
import TaxInvoiceModal from "@/components/TaxInvoiceModal";
import ConfettiCanvas from "@/components/ConfettiCanvas";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  totalPaise: number;
  deliveryOtp?: string;
  estimatedDeliveryMinutes: number;
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
  restaurant: {
    name: string;
    phone: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  deliveryAddressSnapshot: string;
  items: {
    id: string;
    nameSnapshot: string;
    pricePaiseSnapshot: number;
    quantity: number;
    totalPaise: number;
  }[];
  rider?: {
    name: string;
    phone: string;
    riderProfile?: {
      vehicleType: string;
      licenseNumber: string;
      currentLatitude: number;
      currentLongitude: number;
      lastPingAt: string;
    };
  } | null;
  statusHistory: {
    id: string;
    newStatus: string;
    reason: string;
    createdAt: string;
  }[];
  review?: {
    id: string;
    rating: number;
    comment: string;
  } | null;
}

const ORDER_STEPS = [
  { key: "PLACED", label: "Order Placed", desc: "Awaiting restaurant acceptance" },
  { key: "ACCEPTED", label: "Accepted", desc: "Restaurant accepted your order" },
  { key: "PREPARING", label: "Preparing Food", desc: "Kitchen is cooking your meal" },
  { key: "READY", label: "Food Ready", desc: "Packed & awaiting rider pickup" },
  { key: "PICKED_UP", label: "Out for Delivery", desc: "Rider is heading to your doorstep" },
  { key: "DELIVERED", label: "Delivered", desc: "Enjoy your delicious meal!" },
];

function OrderTrackingContent() {
  const urlParams = useParams();
  const id = (urlParams?.id as string) || "";
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Subscribe to SSE stream for live updates
    const eventSource = new EventSource(`/api/realtime/order-stream?orderId=${id}`);

    eventSource.addEventListener("update", (event) => {
      try {
        const updateData = JSON.parse(event.data);
        setOrder((prev) => (prev ? { ...prev, status: updateData.status } : null));
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    });

    // Fallback polling interval
    const interval = setInterval(fetchOrder, 4000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, [id]);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.18); // A5 note
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  };

  const playCelebrationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 fanfare
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.12;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch {}
  };

  useEffect(() => {
    if (order?.status) {
      if (prevStatusRef.current && prevStatusRef.current !== order.status) {
        playChime();
        if (order.status === "DELIVERED") {
          setShowConfetti(true);
          playCelebrationSound();
        }
      } else if (!prevStatusRef.current && order.status === "DELIVERED") {
        setShowConfetti(true);
      }
      prevStatusRef.current = order.status;
    }
  }, [order?.status]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/orders/${id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus: "CANCELLED",
          reason: "Customer requested cancellation within grace period",
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrder();
      } else {
        alert(data.error || "Failed to cancel order");
      }
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSubmitted(true);
        await fetchOrder();
      } else {
        alert(data.error || "Failed to post review");
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse py-8">
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-48 rounded-3xl bg-neutral-200 dark:bg-neutral-800" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <Link href="/" className="mt-4 inline-block text-orange-600 font-bold text-xs">
          Return to Home
        </Link>
      </div>
    );
  }

  let addressObj: {
    addressLine?: string;
    city?: string;
    pincode?: string;
    deliveryInstructions?: string[];
  } = {};
  try {
    addressObj = JSON.parse(order.deliveryAddressSnapshot);
  } catch {}

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.key === order.status);
  const isTerminal = order.status === "CANCELLED" || order.status === "REJECTED";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-orange-600 transition-colors px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-orange-500" /> Tax Invoice
          </button>
          <Link
            href="/support"
            className="flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-orange-600 transition-colors px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-orange-500" /> Need Help?
          </Link>
        </div>
      </div>

      {/* Hero Tracking Status Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                {order.orderNumber}
              </span>
              <span className="text-xs text-neutral-400">
                {formatDateTime(order.createdAt)}
              </span>
            </div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
              {order.restaurant.name}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Total Amount: <span className="font-bold text-neutral-800 dark:text-neutral-200">{formatPaiseToRupees(order.totalPaise)}</span>
            </p>
          </div>

          {/* Delivery OTP Card */}
          {order.deliveryOtp && order.status !== "DELIVERED" && !isTerminal && (
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20 text-center sm:text-right">
              <p className="text-[10px] font-bold tracking-wider uppercase opacity-90 flex items-center justify-center sm:justify-end gap-1">
                <KeyRound className="w-3 h-3" /> Delivery Verification OTP
              </p>
              <p className="text-3xl font-black font-mono tracking-widest my-1">
                {order.deliveryOtp}
              </p>
              <p className="text-[10px] opacity-80">
                Share ONLY with delivery partner upon arrival
              </p>
            </div>
          )}
        </div>

        {/* Live Delivery ETA Banner */}
        {!isTerminal && order.status !== "DELIVERED" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div>
                <p className="text-xs font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <span>Estimated Arrival:</span>
                  <span className="text-orange-600 dark:text-orange-400 font-extrabold text-sm">
                    ~{Math.max(10, order.estimatedDeliveryMinutes || 25)} mins
                  </span>
                </p>
                <p className="text-[10px] text-neutral-500">
                  Live satellite GPS telemetry active
                </p>
              </div>
            </div>

            {addressObj.deliveryInstructions && addressObj.deliveryInstructions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] font-bold text-neutral-400 mr-1">Doorstep Instructions:</span>
                {addressObj.deliveryInstructions.map((inst) => (
                  <span
                    key={inst}
                    className="px-2 py-0.5 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 text-[10px] font-extrabold border border-orange-200 dark:border-orange-900/60"
                  >
                    {inst}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* State Machine Step Progress */}
        {isTerminal ? (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-900 dark:text-red-200">
                Order {order.status}
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                {order.cancellationReason || "This order was cancelled. Any paid amount has been initiated for auto-refund."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isCurrent
                        ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 shadow-md ring-2 ring-orange-500/20"
                        : isPassed
                        ? "border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20"
                        : "border-neutral-200 dark:border-neutral-800 opacity-40"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                        isPassed
                          ? "bg-emerald-600 text-white"
                          : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <p className="text-[11px] font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {step.label}
                    </p>
                    <p className="text-[9px] text-neutral-500 mt-0.5 line-clamp-1">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Cancel within grace period button */}
            {order.status === "PLACED" && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="text-xs font-bold text-red-600 hover:text-red-700 border border-red-200 dark:border-red-800 rounded-xl px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  {isCancelling ? "Cancelling..." : "Cancel Order (Grace Period)"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Interactive GPS Satellite Map */}
      <LiveGpsMap
        status={order.status}
        restaurantName={order.restaurant.name}
        restaurantAddress={order.restaurant.address}
        deliveryAddress={addressObj.addressLine ? `${addressObj.addressLine}, ${addressObj.city || "Mumbai"}` : "Saved Customer Address"}
        riderName={order.rider?.name || "Delivery Partner"}
        riderVehicle={order.rider?.riderProfile?.vehicleType || "Electric Scooter"}
        estimatedMinutes={Math.max(5, order.estimatedDeliveryMinutes || 20)}
      />

      {/* Delivered Order Celebration Banner */}
      {order.status === "DELIVERED" && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-green-500/15 border-2 border-emerald-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-600/30">
              🎉
            </div>
            <div>
              <h2 className="text-lg font-black text-emerald-950 dark:text-emerald-100">
                Order Delivered at Doorstep!
              </h2>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                OTP verified successfully. Thank you for dining with {order.restaurant.name}!
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 shrink-0"
          >
            <FileText className="w-4 h-4" /> Download Tax Invoice
          </button>
        </div>
      )}

      {/* Review Modal for Delivered Order */}
      {order.status === "DELIVERED" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            Rate Your Meal & Delivery
          </h2>

          {order.review || reviewSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Thank you! Your verified review has been published.
              </p>
              <p className="mt-1 text-emerald-700 dark:text-emerald-300">
                "{order.review?.comment || reviewComment}"
              </p>
            </div>
          ) : (
            <form onSubmit={handlePostReview} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                  Select Rating:
                </label>
                <div className="flex gap-2 mt-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`p-2 rounded-xl border transition-all ${
                        reviewRating >= star
                          ? "bg-amber-50 dark:bg-amber-950/50 border-amber-400 text-amber-500"
                          : "border-neutral-200 dark:border-neutral-700 text-neutral-300"
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us what you liked about the food and delivery..."
                  className="w-full p-3 text-xs border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                {/* Quick Compliment Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    "🔥 Steaming Hot",
                    "⚡ Express Delivery",
                    "⭐ Perfect Packaging",
                    "🛵 Friendly Rider",
                    "😋 Delicious Taste",
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setReviewComment((prev) => (prev ? `${prev} • ${tag}` : tag))}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors shadow-md shadow-orange-600/20"
              >
                {isSubmittingReview ? "Submitting Review..." : "Submit Verified Review"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Items Summary Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          Items in this Order
        </h2>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
          {order.items.map((item) => (
            <div key={item.id} className="py-2.5 flex justify-between">
              <div>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                  {item.quantity}x
                </span>{" "}
                <span>{item.nameSnapshot}</span>
              </div>
              <span className="font-bold">{formatPaiseToRupees(item.totalPaise)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confetti & Tax Invoice Modals */}
      <ConfettiCanvas active={showConfetti} />
      <TaxInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={order as any}
      />
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto py-12 text-center text-xs text-neutral-400">
          Loading live order tracking...
        </div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
}
