"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatPaiseToRupees } from "@/lib/formatters";
import { useAuth } from "@/context/AuthContext";
import {
  UtensilsCrossed,
  Plus,
  Check,
  X,
  Clock,
  ArrowLeft,
  Store,
  Sparkles,
  AlertCircle,
  FolderPlus,
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

export default function RestaurantMenuManagerPage() {
  const { user } = useAuth();
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state for new item
  const [categoryMode, setCategoryMode] = useState<"existing" | "new">("existing");
  const [selectedCatId, setSelectedCatId] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceRupees, setPriceRupees] = useState("");
  const [isVeg, setIsVeg] = useState(false);
  const [prepMinutes, setPrepMinutes] = useState("20");
  const [imageUrl, setImageUrl] = useState("");

  const fetchMenu = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/restaurant/menu");
      const data = await res.json();

      if (data.restaurant) {
        setRestaurantName(data.restaurant.name);
      }
      if (data.categories) {
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setSelectedCatId(data.categories[0].id);
          setCategoryMode("existing");
        } else {
          setCategoryMode("new");
        }
      }
    } catch (e) {
      console.error("Error loading menu:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleToggleStock = async (itemId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/restaurant/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, isAvailable: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            menuItems: cat.menuItems.map((item) =>
              item.id === itemId ? { ...item, isAvailable: !currentStatus } : item
            ),
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !priceRupees) {
      setErrorMessage("Dish name and price are required.");
      return;
    }

    if (categoryMode === "new" && !newCatName.trim()) {
      setErrorMessage("Please enter a category name (e.g. Biryani, Starters, Curries).");
      return;
    }

    setErrorMessage(null);

    try {
      const pricePaise = Math.round(parseFloat(priceRupees) * 100);
      const res = await fetch("/api/restaurant/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: categoryMode === "existing" ? selectedCatId : undefined,
          newCategoryName: categoryMode === "new" ? newCatName.trim() : undefined,
          name: name.trim(),
          description: description.trim(),
          pricePaise,
          isVegetarian: isVeg,
          imageUrl: imageUrl.trim() || undefined,
          preparationMinutes: Number(prepMinutes || 20),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddingItem(false);
        setName("");
        setDescription("");
        setPriceRupees("");
        setImageUrl("");
        setNewCatName("");
        await fetchMenu();
      } else {
        setErrorMessage(data.error || "Failed to create menu item.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save dish.");
    }
  };

  const totalDishes = categories.reduce((sum, c) => sum + c.menuItems.length, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/restaurant"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Kitchen Orders
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
              Menu & Stock Management
            </h1>
            {restaurantName && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800 flex items-center gap-1">
                <Store className="w-3 h-3 text-orange-600" />
                {restaurantName}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your kitchen dishes, adjust prices in real-time, and toggle items in or out of stock.
          </p>
        </div>

        <button
          onClick={() => {
            setIsAddingItem(!isAddingItem);
            setErrorMessage(null);
          }}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" /> {isAddingItem ? "Cancel" : "Add New Dish"}
        </button>
      </div>

      {/* Add New Item Form */}
      {isAddingItem && (
        <form
          onSubmit={handleCreateItem}
          className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border-2 border-orange-500/40 shadow-xl space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              Add Dish to {restaurantName || "Your Menu"}
            </h2>
            <span className="text-[11px] text-neutral-400 font-semibold">Live in Customer Catalog</span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                Menu Category
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                {categories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCategoryMode("existing")}
                    className={`font-semibold ${
                      categoryMode === "existing"
                        ? "text-orange-600 underline font-bold"
                        : "text-neutral-400"
                    }`}
                  >
                    Select Existing
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCategoryMode("new")}
                  className={`font-semibold ${
                    categoryMode === "new"
                      ? "text-orange-600 underline font-bold"
                      : "text-neutral-400"
                  }`}
                >
                  + Create New Category
                </button>
              </div>
            </div>

            {categoryMode === "existing" && categories.length > 0 ? (
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full p-2.5 text-xs font-semibold border rounded-xl bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="relative">
                <FolderPlus className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Biryani & Rice, Tandoori Grills, Curries, Desserts"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                Dish Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dum Handi Murg Biryani"
                className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                Price in Rupees (₹)
              </label>
              <input
                type="number"
                step="1"
                required
                value={priceRupees}
                onChange={(e) => setPriceRupees(e.target.value)}
                placeholder="e.g. 349"
                className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                Prep Duration (mins)
              </label>
              <input
                type="number"
                value={prepMinutes}
                onChange={(e) => setPrepMinutes(e.target.value)}
                placeholder="20"
                className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                Photo URL (Optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
              Description & Ingredients
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Slow-cooked marinated chicken layered with aromatic basmati rice..."
              className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Veg / Non-Veg Toggle */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsVeg(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isVeg
                  ? "bg-green-50 dark:bg-green-950/40 border-green-500 text-green-700 dark:text-green-300"
                  : "border-neutral-300 dark:border-neutral-700 text-neutral-500"
              }`}
            >
              <div className="w-3.5 h-3.5 rounded border border-green-600 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
              </div>
              <span>Pure Veg</span>
            </button>

            <button
              type="button"
              onClick={() => setIsVeg(false)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                !isVeg
                  ? "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-300"
                  : "border-neutral-300 dark:border-neutral-700 text-neutral-500"
              }`}
            >
              <div className="w-3.5 h-3.5 rounded border border-red-600 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
              </div>
              <span>Non-Veg</span>
            </button>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95"
          >
            Save Dish to Menu
          </button>
        </form>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent" />
          <p className="text-xs text-neutral-500 mt-3 font-semibold">Loading menu catalog...</p>
        </div>
      ) : totalDishes === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              No Dishes in Menu Yet
            </h2>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
              {restaurantName || "Your restaurant"} currently has no items published. Add your first dish to make it available for customer orders!
            </p>
          </div>
          <button
            onClick={() => setIsAddingItem(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Your First Dish
          </button>
        </div>
      ) : (
        /* Categories & Items List */
        <div className="space-y-8">
          {categories.map((category) => (
            <div
              key={category.id}
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4"
            >
              <h2 className="text-base font-black text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
                <span>{category.name}</span>
                <span className="text-xs font-semibold text-neutral-400">
                  {category.menuItems.length} dishes
                </span>
              </h2>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {category.menuItems.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
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
                        <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs font-semibold text-neutral-500">
                          {formatPaiseToRupees(item.pricePaise)} • {item.preparationMinutes} mins
                        </p>
                      </div>
                    </div>

                    {/* Stock Toggle Button */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleStock(item.id, item.isAvailable)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          item.isAvailable
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                        }`}
                      >
                        {item.isAvailable ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> In Stock
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5" /> Out of Stock
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
