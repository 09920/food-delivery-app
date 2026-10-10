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
  ToggleLeft,
  ToggleRight,
  Edit,
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
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Form state for new item
  const [selectedCatId, setSelectedCatId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceRupees, setPriceRupees] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [prepMinutes, setPrepMinutes] = useState("20");

  const fetchMenu = async () => {
    try {
      const staffRes = await fetch("/api/restaurants");
      const staffData = await staffRes.json();
      if (staffData.restaurants?.[0]?.categories) {
        setCategories(staffData.restaurants[0].categories);
        if (staffData.restaurants[0].categories[0]) {
          setSelectedCatId(staffData.restaurants[0].categories[0].id);
        }
      }
    } catch (e) {
      console.error(e);
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
    if (!name || !priceRupees || !selectedCatId) return;

    try {
      const pricePaise = Math.round(parseFloat(priceRupees) * 100);
      const res = await fetch("/api/restaurant/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCatId,
          name,
          description,
          pricePaise,
          isVegetarian: isVeg,
          preparationMinutes: Number(prepMinutes),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddingItem(false);
        setName("");
        setDescription("");
        setPriceRupees("");
        await fetchMenu();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/restaurant"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Kitchen Orders
          </Link>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
            Menu & Stock Management
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your dishes, adjust prices in real-time, and toggle items in or out of stock.
          </p>
        </div>

        <button
          onClick={() => setIsAddingItem(!isAddingItem)}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" /> {isAddingItem ? "Cancel" : "Add New Dish"}
        </button>
      </div>

      {/* Add New Item Form */}
      {isAddingItem && (
        <form
          onSubmit={handleCreateItem}
          className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border-2 border-amber-500/40 shadow-xl space-y-4"
        >
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Create New Menu Dish
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-neutral-500">Category</label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500">Dish Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Saffron Mutton Galouti Kebab"
                className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500">Price in Rupees (₹)</label>
              <input
                type="number"
                step="1"
                required
                value={priceRupees}
                onChange={(e) => setPriceRupees(e.target.value)}
                placeholder="e.g. 349"
                className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500">Prep Duration (mins)</label>
              <input
                type="number"
                value={prepMinutes}
                onChange={(e) => setPrepMinutes(e.target.value)}
                className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-neutral-500">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Freshly ground spices, grilled slow..."
              className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="vegCheck"
              checked={isVeg}
              onChange={(e) => setIsVeg(e.target.checked)}
              className="text-green-600 focus:ring-green-500"
            />
            <label htmlFor="vegCheck" className="text-xs font-semibold cursor-pointer">
              Is Pure Vegetarian Dish
            </label>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/20"
          >
            Save Dish to Menu
          </button>
        </form>
      )}

      {/* Categories & Items List */}
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
    </div>
  );
}
