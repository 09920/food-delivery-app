"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatPaiseToRupees, formatDateTime } from "@/lib/formatters";
import { useAuth } from "@/context/AuthContext";
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Flame,
  ChefHat,
  PackageCheck,
  TrendingUp,
  Download,
  Power,
  RotateCcw,
} from "lucide-react";

interface KitchenOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalPaise: number;
  createdAt: string;
  customer: { name: string; phone: string };
  rider?: { name: string; phone: string } | null;
  items: { nameSnapshot: string; quantity: number; pricePaiseSnapshot: number }[];
}

export default function RestaurantStaffDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchKitchenData = async () => {
    try {
      const res = await fetch("/api/orders?role=RESTAURANT_STAFF");
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenData();
    const interval = setInterval(fetchKitchenData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusTransition = async (orderId: string, nextStatus: string, reason?: string) => {
    setActionInProgress(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus: nextStatus,
          reason: reason || `Updated by kitchen staff ${user?.name}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchKitchenData();
      } else {
        alert(data.error || "Failed to update order status");
      }
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleToggleStoreStatus = async () => {
    try {
      const nextOpen = !isOpen;
      const res = await fetch("/api/restaurant/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: nextOpen }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOpen(nextOpen);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeOrders = orders.filter((o) =>
    ["PLACED", "ACCEPTED", "PREPARING", "READY"].includes(o.status)
  );
  const completedOrders = orders.filter((o) =>
    ["PICKED_UP", "DELIVERED", "CANCELLED", "REJECTED"].includes(o.status)
  );

  // Compute kitchen analytics
  const totalRevenuePaise = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.totalPaise, 0);

  const exportCsv = () => {
    const headers = "Order Number,Customer,Items,Total (Paise),Status,Date\n";
    const rows = orders
      .map(
        (o) =>
          `"${o.orderNumber}","${o.customer.name}","${o.items.map((i) => `${i.quantity}x ${i.nameSnapshot}`).join("; ")}",${o.totalPaise},"${o.status}","${o.createdAt}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `restaurant_orders_export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner with Store Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800">
        <div>
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-amber-600" />
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
              Kitchen Operations Dashboard
            </h1>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Logged in as Kitchen Manager: <span className="font-bold text-neutral-900 dark:text-neutral-100">{user?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleStoreStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow ${
              isOpen
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {isOpen ? "Store is ONLINE (Accepting)" : "Store is CLOSED (Offline)"}
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-bold hover:bg-neutral-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <p className="text-[11px] font-bold text-neutral-400 uppercase">Live Incoming</p>
          <p className="text-2xl font-black text-orange-600 mt-1">{activeOrders.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <p className="text-[11px] font-bold text-neutral-400 uppercase">Total Completed</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {orders.filter((o) => o.status === "DELIVERED").length}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <p className="text-[11px] font-bold text-neutral-400 uppercase">Kitchen Gross Revenue</p>
          <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
            {formatPaiseToRupees(totalRevenuePaise)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <p className="text-[11px] font-bold text-neutral-400 uppercase">Avg Prep Target</p>
          <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
            20 mins
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "active"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          }`}
        >
          Active Kitchen Orders ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "history"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          }`}
        >
          Fulfilled & History ({completedOrders.length})
        </button>
      </div>

      {/* Active Orders Kanban / Action Cards */}
      {activeTab === "active" ? (
        activeOrders.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
              Kitchen is all caught up!
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              New incoming customer orders will appear here with live notification alerts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeOrders.map((order) => {
              const isWorking = actionInProgress === order.id;

              return (
                <div
                  key={order.id}
                  className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border-2 border-amber-500/40 dark:border-amber-600/40 shadow-lg flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
                        STATUS: {order.status}
                      </span>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-neutral-500">
                        Customer: <span className="font-bold text-neutral-900 dark:text-neutral-100">{order.customer.name}</span> ({order.customer.phone})
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Placed: {formatDateTime(order.createdAt)}
                      </p>
                    </div>

                    {/* Dishes list */}
                    <div className="mt-4 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 divide-y divide-neutral-200/50 dark:divide-neutral-700/50 text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-1.5 flex justify-between font-medium">
                          <span>
                            <strong className="text-amber-600 font-bold">{item.quantity}x</strong>{" "}
                            {item.nameSnapshot}
                          </span>
                          <span className="text-neutral-500">
                            {formatPaiseToRupees(item.pricePaiseSnapshot * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operational Action Buttons according to state */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap gap-2">
                    {order.status === "PLACED" && (
                      <>
                        <button
                          onClick={() => handleStatusTransition(order.id, "ACCEPTED")}
                          disabled={isWorking}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                        >
                          {isWorking ? "Processing..." : "Accept Order"}
                        </button>
                        <button
                          onClick={() =>
                            handleStatusTransition(order.id, "REJECTED", "Kitchen at capacity")
                          }
                          disabled={isWorking}
                          className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-all"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {order.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleStatusTransition(order.id, "PREPARING")}
                        disabled={isWorking}
                        className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20 flex items-center justify-center gap-1.5"
                      >
                        <Flame className="w-4 h-4" />
                        <span>Start Cooking (PREPARING)</span>
                      </button>
                    )}

                    {order.status === "PREPARING" && (
                      <button
                        onClick={() => handleStatusTransition(order.id, "READY")}
                        disabled={isWorking}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Food Packed & READY for Pickup</span>
                      </button>
                    )}

                    {order.status === "READY" && (
                      <div className="w-full p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 text-xs text-center font-bold">
                        Awaiting Rider Handover
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* History list */
        <div className="space-y-3">
          {completedOrders.map((order) => (
            <div
              key={order.id}
              className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                  {order.orderNumber}
                </span>{" "}
                • {order.customer.name} • {order.items.map((i) => `${i.quantity}x ${i.nameSnapshot}`).join(", ")}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{formatPaiseToRupees(order.totalPaise)}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    order.status === "DELIVERED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
