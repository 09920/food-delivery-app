"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
    name: string;
    menuItems: { id: string; name: string; pricePaise: number; isVegetarian: boolean }[];
  }[];
}

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [vegOnly, setVegOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchRestaurants();
    fetchFavorites();
  }, [searchQuery, selectedCuisine, vegOnly, minRating]);

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

  const cuisinesList = ["North Indian", "Biryani", "Mughlai", "Pan-Asian", "Dim Sum", "Chinese"];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner with Modern Gradient */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white p-8 sm:p-12 shadow-2xl shadow-orange-500/20">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Flavors delivered in under 30 minutes
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Craving something delicious today?
          </h1>
          <p className="text-orange-100 text-sm sm:text-base max-w-xl">
            Order from top FSSAI-certified kitchen partners in Mumbai. Real-time GPS rider tracking, doorstep OTP verification, and instant online payments.
          </p>

          {/* Search Bar */}
          <div className="pt-2">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl overflow-hidden text-neutral-900">
              <Search className="w-5 h-5 ml-4 text-neutral-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants, dishes (e.g. Biryani, Tikka, Dumplings)..."
                className="w-full px-4 py-3.5 text-sm outline-none placeholder-neutral-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mr-3 text-xs font-bold text-neutral-400 hover:text-neutral-700 px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Decorative backdrop elements */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
      </div>

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
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>Explore Restaurants</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {restaurants.length} kitchens
            </span>
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 rounded-3xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"
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
              return (
                <Link
                  key={restaurant.id}
                  href={`/restaurants/${restaurant.slug || restaurant.id}`}
                  className="group rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
                >
                  {/* Restaurant Cover Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
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
                    </div>

                    {/* Popular Dishes Preview */}
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
