"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import {
  ShoppingBag,
  User,
  UtensilsCrossed,
  Bike,
  ShieldCheck,
  ChevronDown,
  Clock,
  Sparkles,
  MapPin,
  Heart,
  HelpCircle,
  LogIn,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

interface NavbarProps {
  onOpenCart?: () => void;
}

export default function Navbar({ onOpenCart }: NavbarProps) {
  const { user, availablePersonas, switchPersona } = useAuth();
  const { items } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Bandra West, Mumbai");

  const locations = [
    { name: "Bandra West, Mumbai", tag: "Fastest 20-25m" },
    { name: "Andheri West, Mumbai", tag: "25-30m" },
    { name: "Powai, Mumbai", tag: "25-30m" },
    { name: "Colaba, Mumbai", tag: "30-35m" },
    { name: "Juhu, Mumbai", tag: "20-25m" },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300";
      case "RESTAURANT_STAFF":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300";
      case "RIDER":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300";
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      case "RESTAURANT_STAFF":
        return <UtensilsCrossed className="w-4 h-4 text-amber-600" />;
      case "RIDER":
        return <Bike className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/85 dark:bg-[#0e1117]/85 backdrop-blur-xl border-b border-neutral-200/80 dark:border-neutral-800/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Title + Location Selector */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  OFDS
                </span>
                <span className="hidden sm:inline-block ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300">
                  FOOD DELIVERY
                </span>
              </div>
            </Link>

            {/* Delivery Location Selector (Swiggy/Zomato style) */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-800/60 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-bold text-neutral-900 dark:text-neutral-100">Deliver to:</span>
                <span className="truncate max-w-[130px] font-medium text-neutral-600 dark:text-neutral-300">
                  {selectedLocation}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {isLocationMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
                    Select Delivery Neighborhood
                  </div>
                  <div className="p-1 space-y-0.5">
                    {locations.map((loc) => (
                      <button
                        key={loc.name}
                        onClick={() => {
                          setSelectedLocation(loc.name);
                          setIsLocationMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          selectedLocation === loc.name
                            ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold"
                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        <span className="truncate">{loc.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold flex-shrink-0">
                          {loc.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Role-Specific Portal Links */}
            <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
              <Link
                href="/"
                className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
              >
                Discover
              </Link>

              {user?.role === "CUSTOMER" && (
                <>
                  <Link
                    href="/orders"
                    className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/addresses"
                    className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    Addresses
                  </Link>
                  <Link
                    href="/support"
                    className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    Support
                  </Link>
                </>
              )}

              {user?.role === "RESTAURANT_STAFF" && (
                <>
                  <Link
                    href="/restaurant"
                    className="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold transition-colors"
                  >
                    Kitchen Live Orders
                  </Link>
                  <Link
                    href="/restaurant/menu"
                    className="px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    Menu Manager
                  </Link>
                </>
              )}

              {user?.role === "RIDER" && (
                <Link
                  href="/rider"
                  className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold transition-colors"
                >
                  Rider Dashboard
                </Link>
              )}

              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold transition-colors"
                >
                  Platform Operations
                </Link>
              )}
            </nav>
          </div>

          {/* Right Section: Account Menu & Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {!user ? (
              <Link
                href="/login"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700/80 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-all shadow-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold max-w-[110px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {isPersonaMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/orders"
                        onClick={() => setIsPersonaMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 font-medium transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <span>My Orders & Live Tracking</span>
                      </Link>
                      <Link
                        href="/addresses"
                        onClick={() => setIsPersonaMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 font-medium transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        <span>Saved Delivery Addresses</span>
                      </Link>
                      <Link
                        href="/support"
                        onClick={() => setIsPersonaMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 font-medium transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
                        <span>Help & Support</span>
                      </Link>

                      {user.role === "RESTAURANT_STAFF" && (
                        <Link
                          href="/restaurant"
                          onClick={() => setIsPersonaMenuOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold transition-colors"
                        >
                          <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
                          <span>Restaurant Partner Portal</span>
                        </Link>
                      )}

                      {user.role === "RIDER" && (
                        <Link
                          href="/rider"
                          onClick={() => setIsPersonaMenuOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-semibold transition-colors"
                        >
                          <Bike className="w-3.5 h-3.5 text-blue-500" />
                          <span>Delivery Rider Portal</span>
                        </Link>
                      )}

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setIsPersonaMenuOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-semibold transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                          <span>Operations Dashboard</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 mt-1 border-t border-neutral-100 dark:border-neutral-800 px-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle Button (Light / Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100/90 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 active:scale-95 transition-all text-xs font-semibold shadow-xs"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Click to switch to Light Mode" : "Click to switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-400 hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-neutral-600" />
                  <span className="text-[11px] font-bold text-neutral-600 hidden sm:inline">Light</span>
                </>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-900">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
