"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { formatPaiseToRupees } from "@/lib/formatters";
import {
  Search,
  Star,
  Clock,
  Sparkles,
  MapPin,
  ChevronRight,
  Filter,
  Check,
  Flame,
  ShieldCheck,
  Heart,
  Utensils,
  Layers,
  ArrowRight,
  Store,
  Zap,
  Tag,
  Percent,
  ArrowUpRight,
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  rating: number;
  reviewCount: number;
  averagePreparationMinutes: number;
  cuisineTypes: string;
  imageUrl: string;
  address: string;
  isOpen: boolean;
  categories: {
    id: string;
    name: string;
    menuItems: { id: string; name: string; pricePaise: number; isVegetarian: boolean }[];
  }[];
}

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [vegOnly, setVegOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchRestaurants();
    fetchFavorites();
  }, [searchQuery, selectedCuisine, vegOnly, minRating]);

  // Extract matching dishes from currently loaded restaurants
  const matchingDishes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const dishes: {
      id: string;
      name: string;
      pricePaise: number;
      isVegetarian: boolean;
      restaurantId: string;
      restaurantName: string;
    }[] = [];

    for (const rest of restaurants) {
      for (const cat of rest.categories || []) {
        for (const item of cat.menuItems || []) {
          if (
            item.name.toLowerCase().includes(q) ||
            cat.name.toLowerCase().includes(q)
          ) {
            dishes.push({
              id: item.id,
              name: item.name,
              pricePaise: item.pricePaise,
              isVegetarian: item.isVegetarian,
              restaurantId: rest.id,
              restaurantName: rest.name,
            });
            if (dishes.length >= 6) return dishes;
          }
        }
      }
    }
    return dishes;
  }, [restaurants, searchQuery]);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedCuisine) params.set("cuisine", selectedCuisine);
      if (vegOnly) params.set("vegOnly", "true");
      if (minRating > 0) params.set("minRating", minRating.toString());

      const res = await fetch(`/api/restaurants?${params.toString()}`);
      const data = await res.json();
      if (data.restaurants) {
        setRestaurants(data.restaurants);
      }
    } catch (e) {
      console.error("Fetch restaurants error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/customer/favorites");
      const data = await res.json();
      if (data.favoriteRestaurants) {
        setFavorites(data.favoriteRestaurants.map((r: { id: string }) => r.id));
      }
    } catch (e) {
      // Graceful fallback
    }
  };

  const toggleFavorite = async (restaurantId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch("/api/customer/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId }),
      });
      const data = await res.json();
      if (data.isFavorite) {
        setFavorites((prev) => [...prev, restaurantId]);
      } else {
        setFavorites((prev) => prev.filter((id) => id !== restaurantId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categoriesShowcase = [
    { name: "Biryani & Kebabs", cuisine: "Biryani", icon: "🍗", desc: "Dum Biryani & Tandoor" },
    { name: "Artisan Pizza", cuisine: "Pizza", icon: "🍕", desc: "Woodfired Neapolitan" },
    { name: "Craft Burgers", cuisine: "Gourmet Burgers", icon: "🍔", desc: "Brioche Smashed" },
    { name: "Sushi & Ramen", cuisine: "Sushi", icon: "🍣", desc: "Tokyo Craft Nigiri" },
    { name: "Mexican Tacos", cuisine: "Mexican", icon: "🌮", desc: "Birria & Street Tacos" },
    { name: "Shawarma & Mezze", cuisine: "Lebanese", icon: "🥙", desc: "Toum & Charcoal Grills" },
    { name: "Crispy Dosas", cuisine: "South Indian", icon: "🥞", desc: "Ghee Roast & Tiffins" },
    { name: "Dim Sum & Wok", cuisine: "Pan-Asian", icon: "🥟", desc: "Har Gao & Noodles" },
    { name: "French Bakery", cuisine: "Bakery", icon: "🥐", desc: "Croissants & Patisserie" },
    { name: "Superfood Bowls", cuisine: "Healthy", icon: "🥗", desc: "Quinoa, Salads & Acai" },
    { name: "Mumbai Chaat", cuisine: "Street Food", icon: "🥘", desc: "Pav Bhaji & Sev Puri" },
    { name: "Coastal Seafood", cuisine: "Seafood", icon: "🦐", desc: "Goan Curry & Tawa Fry" },
  ];

  const cuisinesList = [
    "North Indian",
    "Biryani",
    "Italian",
    "Gourmet Burgers",
    "Japanese",
    "Sushi",
    "Mexican",
    "Lebanese",
    "South Indian",
    "Pan-Asian",
    "Bakery",
    "Healthy",
    "Street Food",
    "Seafood",
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Modern High-Conversion Culinary Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-orange-600 via-amber-600 to-red-600 text-white p-6 sm:p-10 lg:p-12 shadow-2xl shadow-orange-500/25 overflow-visible">
        {/* Ambient decorative overlays */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-1/4 -bottom-20 w-80 h-80 rounded-full bg-amber-400/20 blur-2xl" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Headlines & Search */}
          <div className="lg:col-span-7 space-y-5">
            {/* Urgent Coupon / Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wide">
              <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>
                FLAT 50% OFF • USE CODE <button type="button" onClick={() => handleCopyCoupon("WELCOME50")} className="underline decoration-amber-300 font-extrabold hover:text-amber-200">WELCOME50</button>
              </span>
              {copiedCoupon === "WELCOME50" && (
                <span className="ml-1 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">COPIED!</span>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-[1.15]">
                Craving delicious food in Mumbai?
              </h1>
              <p className="text-orange-100 text-sm sm:text-base max-w-xl leading-relaxed">
                Order authentic slow-dum biryanis, woodfired pizzas, smashed brioche burgers, sushi, & street chaat — delivered steaming hot in under 30 minutes.
              </p>
            </div>

          {/* Search Bar with Instant Predictive Dropdown */}
          <div ref={searchContainerRef} className="pt-2 relative z-30">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl overflow-hidden text-neutral-900 border-2 border-transparent focus-within:border-amber-400 transition-all">
              <Search className="w-5 h-5 ml-4 text-neutral-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder="Search restaurants, cuisines, or dishes (e.g. Biryani, Pizza, Burger, Sushi, Tacos)..."
                className="w-full px-4 py-3.5 text-sm outline-none placeholder-neutral-400 font-medium bg-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mr-3 text-xs font-bold text-neutral-400 hover:text-neutral-700 px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Instant Floating Dropdown (Swiggy / Zomato style) */}
            {searchQuery.trim().length > 0 && isSearchFocused && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 z-50 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-900 dark:text-neutral-100 animate-in fade-in zoom-in-95 duration-100 max-h-96 overflow-y-auto">
                <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-850 flex items-center justify-between text-xs font-bold text-neutral-500">
                  <span>Results for &ldquo;{searchQuery}&rdquo;</span>
                  <span>{matchingDishes.length + restaurants.length} matches</span>
                </div>

                {/* Matching Dishes */}
                {matchingDishes.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 pt-1 pb-1 text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                      Dishes & Items
                    </p>
                    <div className="space-y-0.5">
                      {matchingDishes.map((dish) => (
                        <Link
                          key={`${dish.restaurantId}-${dish.id}`}
                          href={`/restaurants/${dish.restaurantId}`}
                          onClick={() => setIsSearchFocused(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-3.5 h-3.5 flex-shrink-0 rounded border flex items-center justify-center ${
                                dish.isVegetarian ? "border-green-600" : "border-red-600"
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  dish.isVegetarian ? "bg-green-600" : "bg-red-600"
                                }`}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-orange-600 transition-colors truncate">
                                {dish.name}
                              </p>
                              <p className="text-[10px] text-neutral-500 truncate">
                                at {dish.restaurantName}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-neutral-800 dark:text-neutral-200 ml-3">
                            {formatPaiseToRupees(dish.pricePaise)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matching Restaurants */}
                {restaurants.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 pt-1 pb-1 text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                      Restaurants
                    </p>
                    <div className="space-y-0.5">
                      {restaurants.slice(0, 4).map((rest) => (
                        <Link
                          key={rest.id}
                          href={`/restaurants/${rest.id}`}
                          onClick={() => setIsSearchFocused(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0">
                              <img
                                src={rest.imageUrl}
                                alt={rest.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-orange-600 transition-colors truncate">
                                {rest.name}
                              </p>
                              <p className="text-[10px] text-neutral-500 truncate">
                                {rest.cuisineTypes}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{rest.rating}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Smooth Scroll Trigger */}
                <div className="p-2 bg-neutral-50 dark:bg-neutral-850 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchFocused(false);
                      document.getElementById("restaurants-grid")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>View all {restaurants.length} matching restaurants below</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

            {/* Quick Keyword Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-orange-200 font-semibold mr-1">Trending:</span>
              {["Biryani", "Pizza", "Burger", "Sushi", "Tacos", "Dosa"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    setIsSearchFocused(true);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-md text-white font-medium text-[11px] transition-all cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Social Proof & Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-orange-100 font-medium">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span><strong className="text-white font-bold">4.8+</strong> (25k+ Reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-300" />
                <span><strong className="text-white font-bold">25 Mins</strong> Avg Doorstep ETA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span><strong className="text-white font-bold">FSSAI</strong> Certified Kitchens</span>
              </div>
            </div>
          </div>

          {/* Right Column: Culinary Spotlight Visual Card */}
          <div className="hidden lg:flex lg:col-span-5 relative justify-center">
            {/* Floating Live Express Badge */}
            <div className="absolute -top-3 -right-2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 text-white text-xs font-bold shadow-2xl">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>⚡ 24 min Express ETA</span>
            </div>

            {/* Glassmorphic Chef's Spotlight Showcase */}
            <div className="w-full bg-white/15 dark:bg-black/35 backdrop-blur-xl border border-white/25 rounded-3xl p-5 shadow-2xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="font-extrabold text-sm tracking-tight text-white">
                    Chef&apos;s Signature Spotlight
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  MUMBAI TOP PICKS
                </span>
              </div>

              {/* Spotlight Items */}
              <div className="space-y-2">
                {[
                  { name: "Royal Awadhi Dum Biryani", rest: "Behrouz Handi", price: "₹380", rating: "4.9", emoji: "🍗" },
                  { name: "Truffle Burrata Woodfired Pizza", rest: "La Pino'z Gourmet", price: "₹420", rating: "4.8", emoji: "🍕" },
                  { name: "Double Smashed Wagyu Burger", rest: "Burger Loft", price: "₹320", rating: "4.9", emoji: "🍔" },
                  { name: "Crunchy Salmon Nigiri & Maki", rest: "Tokyo Dining", price: "₹490", rating: "4.8", emoji: "🍣" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                        {item.emoji}
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{item.name}</p>
                        <p className="text-[10px] text-orange-200">{item.rest}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold">{item.price}</p>
                      <p className="text-[10px] font-bold text-amber-300 flex items-center justify-end gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        {item.rating}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Promo Note */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-orange-100 font-semibold">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-300" />
                  Code: <strong className="text-white">FREEDEL</strong> for Free Delivery
                </span>
                <button
                  type="button"
                  className="text-white font-bold underline cursor-pointer"
                  onClick={() => handleCopyCoupon("FREEDEL")}
                >
                  {copiedCoupon === "FREEDEL" ? "Copied!" : "Copy Code"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Promotional Offers Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            code: "WELCOME50",
            title: "50% OFF Up to ₹120",
            desc: "On your first meal order today",
            bg: "from-amber-500/10 to-orange-500/10 border-orange-200 dark:border-orange-900/50",
            iconColor: "text-orange-500",
            icon: Tag,
          },
          {
            code: "FREEDEL",
            title: "Zero ₹0 Delivery Fee",
            desc: "On all orders above ₹199",
            bg: "from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-900/50",
            iconColor: "text-emerald-500",
            icon: Zap,
          },
          {
            code: "GOURMET20",
            title: "Flat ₹100 Gourmet Off",
            desc: "On top fine-dining partners",
            bg: "from-purple-500/10 to-indigo-500/10 border-purple-200 dark:border-purple-900/50",
            iconColor: "text-purple-500",
            icon: Sparkles,
          },
          {
            code: "HEALTHY15",
            title: "15% Healthy Cashback",
            desc: "On superfood bowls & salads",
            bg: "from-green-500/10 to-lime-500/10 border-green-200 dark:border-green-900/50",
            iconColor: "text-green-500",
            icon: Percent,
          },
        ].map((deal) => {
          const Icon = deal.icon;
          const isCopied = copiedCoupon === deal.code;
          return (
            <div
              key={deal.code}
              className={`p-3.5 rounded-2xl border bg-gradient-to-br ${deal.bg} bg-white dark:bg-neutral-900 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all group`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 ${deal.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                    {deal.title}
                  </h4>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                    {deal.desc}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCoupon(deal.code)}
                className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-orange-500 bg-neutral-50 dark:bg-neutral-800 text-[10px] font-black text-neutral-700 dark:text-neutral-300 hover:text-orange-600 transition-colors flex-shrink-0 cursor-pointer"
              >
                {isCopied ? "COPIED" : deal.code}
              </button>
            </div>
          );
        })}
      </section>

      {/* Popular Food Categories Showcase (Swiggy / Zomato Circular Dish Cards) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-600" />
              <span>What&apos;s on your mind?</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Explore Mumbai&apos;s favorite food categories and cuisines
            </p>
          </div>
          {selectedCuisine && (
            <button
              onClick={() => setSelectedCuisine(null)}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 underline cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categoriesShowcase.map((cat) => {
            const isSelected = selectedCuisine === cat.cuisine;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCuisine(isSelected ? null : cat.cuisine)}
                className={`p-4 rounded-3xl border text-center transition-all duration-200 flex flex-col items-center justify-between group cursor-pointer ${
                  isSelected
                    ? "bg-orange-600 border-orange-600 text-white shadow-xl shadow-orange-600/30 scale-105"
                    : "bg-white dark:bg-neutral-900/90 border-neutral-200/80 dark:border-neutral-800 hover:border-orange-400 dark:hover:border-neutral-700 hover:shadow-lg hover:-translate-y-1 text-neutral-900 dark:text-neutral-100"
                }`}
              >
                {/* Circular Dish Badge */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-2.5 transition-transform group-hover:scale-110 duration-200 shadow-inner ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-red-500/15 border border-orange-500/20"
                  }`}
                >
                  {cat.icon}
                </div>
                <div>
                  <h3 className={`text-xs font-extrabold leading-tight ${isSelected ? "text-white" : ""}`}>
                    {cat.name}
                  </h3>
                  <p
                    className={`text-[10px] mt-0.5 line-clamp-1 ${
                      isSelected ? "text-orange-100" : "text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    {cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-2 overflow-x-auto">
        <button
          onClick={() => setVegOnly(!vegOnly)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
            vegOnly
              ? "bg-green-700 border-green-800 text-white shadow-md shadow-green-700/20"
              : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-green-500" />
          Pure Veg
        </button>

        <button
          onClick={() => setMinRating(minRating === 4.5 ? 0 : 4.5)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
            minRating === 4.5
              ? "bg-amber-600 border-amber-700 text-white shadow-md shadow-amber-600/20"
              : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          Top Rated (4.5+)
        </button>

        <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />

        {cuisinesList.map((cuisine) => {
          const isSelected = selectedCuisine === cuisine;
          return (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(isSelected ? null : cuisine)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isSelected
                  ? "bg-orange-600 border-orange-700 text-white shadow-md shadow-orange-600/20"
                  : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
              }`}
            >
              {cuisine}
            </button>
          );
        })}
      </div>

      {/* Restaurant List Section */}
      <section id="restaurants-grid" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>Explore Restaurants</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {restaurants.length} kitchens
            </span>
          </h2>
          {selectedCuisine && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
              Filtered by: {selectedCuisine}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-80 rounded-3xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"
              />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800">
            <p className="text-base font-bold text-neutral-700 dark:text-neutral-300">
              No restaurants found matching your criteria
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Try resetting your search filters or clearing the search query.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCuisine(null);
                setVegOnly(false);
                setMinRating(0);
              }}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => {
              const isFav = favorites.includes(restaurant.id);
              const popularDishes = restaurant.categories
                ? restaurant.categories
                    .flatMap((c) => c.menuItems.map((m) => m.name))
                    .slice(0, 3)
                : [];

              return (
                <Link
                  key={restaurant.id}
                  href={`/restaurants/${restaurant.slug || restaurant.id}`}
                  className="group rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
                >
                  {/* Restaurant Cover Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"}
                      alt={restaurant.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shadow">
                        <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Certified
                      </span>

                      <button
                        onClick={(e) => toggleFavorite(restaurant.id, e)}
                        className="p-2 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-700 hover:text-red-500 transition-colors shadow"
                        aria-label="Favorite"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFav ? "fill-red-500 text-red-500" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 backdrop-blur-md">
                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                        <span>{restaurant.averagePreparationMinutes + 10} mins</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{restaurant.rating}</span>
                        <span className="text-[10px] opacity-80">
                          ({restaurant.reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details Card */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 group-hover:text-orange-600 transition-colors">
                          {restaurant.name}
                        </h3>
                        {!restaurant.isOpen && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                            Closed
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
                        {restaurant.cuisineTypes}
                      </p>

                      <p className="text-xs text-neutral-400 flex items-center gap-1 mt-1.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{restaurant.address}</span>
                      </p>

                      {/* Category Pills */}
                      {restaurant.categories && restaurant.categories.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {restaurant.categories.slice(0, 3).map((cat) => (
                            <span
                              key={cat.id || cat.name}
                              className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] font-medium"
                            >
                              {cat.name}
                            </span>
                          ))}
                          {restaurant.categories.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-neutral-50 dark:bg-neutral-850 text-neutral-400 text-[10px] font-medium">
                              +{restaurant.categories.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Featured Dishes Preview */}
                      {popularDishes.length > 0 && (
                        <p className="mt-2.5 text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1">
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300">Dishes: </span>
                          {popularDishes.join(" • ")}
                        </p>
                      )}
                    </div>

                    {/* View Menu & Order CTA */}
                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold text-orange-600 dark:text-orange-400">
                      <span>View Menu & Order</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
