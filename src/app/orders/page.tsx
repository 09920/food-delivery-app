"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatPaiseToRupees, formatDateTime } from "@/lib/formatters";
import { Clock, ChevronRight, ShoppingBag, ArrowRight } from "lucide-react";

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalPaise: number;
  createdAt: string;
  restaurantSnapshot?: string;
  restaurant?: {
    id: string;
    name: string;
    imageUrl?: string;
  } | null;
  items: {
    id: string;
    nameSnapshot: string;
    quantity: number;
  }[];
}

export default function CustomerOrdersHistoryPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders?role=CUSTOMER")
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
      case "CANCELLED":
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300";
      default:
        return "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 animate-pulse";
    }
  };

  const getRestaurantInfo = (order: OrderSummary) => {
    let name = order.restaurant?.name;
    const imageUrl =
      order.restaurant?.imageUrl ||
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=256&q=80";

    if (!name && order.restaurantSnapshot) {
      try {
        const snap = JSON.parse(order.restaurantSnapshot);
        name = snap.name;
      } catch {
        // Fallback
      }
    }

    return {
      name: name || "Restaurant Kitchen",
      imageUrl,
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
          My Order History
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Track active deliveries and review previous culinary orders.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800">
          <ShoppingBag className="w-10 h-10 mx-auto text-neutral-400 mb-2" />
          <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
            No orders placed yet
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors"
          >
            Explore Restaurants <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const restInfo = getRestaurantInfo(order);

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-orange-500/50 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={restInfo.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=256&q=80"}
                      alt={restInfo.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=256&q=80";
                      }}
                      className="w-14 h-14 rounded-2xl object-cover bg-neutral-100 flex-shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-orange-600 transition-colors">
                        {restInfo.name}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {formatDateTime(order.createdAt)} • {order.orderNumber}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-1">
                        {order.items.map((i) => `${i.quantity}x ${i.nameSnapshot}`).join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                    <p className="font-black text-sm text-neutral-900 dark:text-neutral-100 mt-1.5">
                      {formatPaiseToRupees(order.totalPaise)}
                    </p>
                    <span className="text-[11px] font-bold text-orange-600 inline-flex items-center gap-0.5 mt-1">
                      Details <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
