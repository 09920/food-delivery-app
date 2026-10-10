"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPaiseToRupees } from "@/lib/formatters";
import {
  Star,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Plus,
  Minus,
  Check,
  Heart,
  ChevronRight,
  Sparkles,
  MessageSquare,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  pricePaise: number;
  isVegetarian: boolean;
  isAvailable: boolean;
  imageUrl: string;
  preparationMinutes: number;
}

interface MenuCategory {
  id: string;
  name: string;
  menuItems: MenuItem[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: { name: string; avatarUrl?: string };
}

interface RestaurantData {
  id: string;
  name: string;
  description: string;
  fssaiLicense: string;
  phone: string;
  address: string;
  rating: number;
  reviewCount: number;
  averagePreparationMinutes: number;
  cuisineTypes: string;
  imageUrl: string;
  isOpen: boolean;
  categories: MenuCategory[];
  reviews: Review[];
}

function RestaurantDetailContent() {
  const urlParams = useParams();
  const id = (urlParams?.id as string) || "";
  const { items, addToCart, updateQuantity } = useCart();
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [activeTab, setActiveTab] = useState<"menu" | "reviews">("menu");
  const [vegFilterOnly, setVegFilterOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.restaurant) setRestaurant(data.restaurant);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 rounded-3xl bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold">Restaurant not found</h2>
        <p className="text-sm text-neutral-500 mt-2">The kitchen you are looking for does not exist.</p>
      </div>
    );
  }

  const getItemQuantity = (itemId: string) => {
    return items.find((i) => i.menuItemId === itemId)?.quantity || 0;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white shadow-xl">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-64 sm:h-80 object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold flex items-center gap-1 shadow">
                <ShieldCheck className="w-3.5 h-3.5" /> FSSAI: {restaurant.fssaiLicense}
              </span>
              {!restaurant.isOpen && (
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold">
                  Currently Closed
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{restaurant.name}</h1>
            <p className="text-sm text-neutral-300 mt-1 max-w-xl">{restaurant.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300 mt-3 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400" /> {restaurant.address}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-orange-400" /> {restaurant.phone}
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/20 backdrop-blur-md text-white font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{restaurant.rating}</span>
              <span className="text-xs opacity-75">({restaurant.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-neutral-300 font-semibold">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>Prep: {restaurant.averagePreparationMinutes} mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Veg Filter Switch */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "menu"
                ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            Menu & Dishes
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "reviews"
                ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            Reviews & Ratings ({restaurant.reviews.length})
          </button>
        </div>

        {activeTab === "menu" && (
          <button
            onClick={() => setVegFilterOnly(!vegFilterOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              vegFilterOnly
                ? "bg-green-700 border-green-800 text-white"
                : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Vegetarian Only
          </button>
        )}
      </div>

      {/* Tab 1: Menu Items by Category */}
      {activeTab === "menu" && (
        <div className="space-y-10">
          {restaurant.categories.map((category) => {
            const filteredItems = vegFilterOnly
              ? category.menuItems.filter((i) => i.isVegetarian)
              : category.menuItems;

            if (filteredItems.length === 0) return null;

            return (
              <section key={category.id} className="space-y-4">
                <h3 className="text-lg font-black tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <span>{category.name}</span>
                  <span className="text-xs font-semibold text-neutral-400">
                    ({filteredItems.length})
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredItems.map((item) => {
                    const quantity = getItemQuantity(item.id);

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex gap-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-sm"
                      >
                        {/* Food info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
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
                              <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                                {item.name}
                              </span>
                            </div>

                            <p className="text-xs font-black text-neutral-800 dark:text-neutral-200">
                              {formatPaiseToRupees(item.pricePaise)}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-400">
                            <Clock className="w-3 h-3" />
                            <span>{item.preparationMinutes} mins</span>
                          </div>
                        </div>

                        {/* Food image & Add to cart button */}
                        <div className="relative w-28 h-28 flex-shrink-0 flex flex-col items-center justify-end">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-xl shadow-inner bg-neutral-100"
                          />

                          <div className="absolute -bottom-2">
                            {quantity > 0 ? (
                              <div className="flex items-center bg-white dark:bg-neutral-800 rounded-lg shadow-md border border-orange-500 font-bold text-xs text-orange-600">
                                <button
                                  onClick={() => updateQuantity(item.id, quantity - 1)}
                                  className="px-2 py-1 hover:bg-orange-50 dark:hover:bg-neutral-700 rounded-l"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2">{quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, quantity + 1)}
                                  className="px-2 py-1 hover:bg-orange-50 dark:hover:bg-neutral-700 rounded-r"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  addToCart(
                                    {
                                      id: item.id,
                                      name: item.name,
                                      pricePaise: item.pricePaise,
                                      isVegetarian: item.isVegetarian,
                                      imageUrl: item.imageUrl,
                                    },
                                    { id: restaurant.id, name: restaurant.name }
                                  )
                                }
                                disabled={!item.isAvailable || !restaurant.isOpen}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black shadow-md uppercase tracking-wider transition-all ${
                                  !item.isAvailable || !restaurant.isOpen
                                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                                    : "bg-white dark:bg-neutral-800 text-orange-600 border border-neutral-300 dark:border-neutral-700 hover:bg-orange-50 hover:border-orange-500 active:scale-95"
                                }`}
                              >
                                {item.isAvailable ? "Add" : "Out of Stock"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Tab 2: Verified Reviews */}
      {activeTab === "reviews" && (
        <div className="space-y-4 max-w-3xl">
          {restaurant.reviews.length === 0 ? (
            <p className="text-sm text-neutral-500 py-8">No customer reviews yet.</p>
          ) : (
            restaurant.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center">
                      {rev.user.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {rev.user.name}
                      </p>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Verified Purchase
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{rev.rating}/5</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function RestaurantDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto py-12 text-center text-xs text-neutral-400">
          Loading restaurant menu...
        </div>
      }
    >
      <RestaurantDetailContent />
    </Suspense>
  );
}
