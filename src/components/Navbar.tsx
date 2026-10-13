"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
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
} from "lucide-react";

interface NavbarProps {
  onOpenCart?: () => void;
}

export default function Navbar({ onOpenCart }: NavbarProps) {
  const { user, availablePersonas, switchPersona } = useAuth();
  const { items } = useCart();
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-6">
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

          {/* Right Section: Persona Switcher & Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3">

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 bg-neutral-50 dark:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 shadow-sm transition-all"
              >
                {user && getRoleIcon(user.role)}
                <span className="font-semibold">{user?.name || "Select Role"}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${getRoleBadge(
                    user?.role || "CUSTOMER"
                  )}`}
                >
                  {user?.role.replace("_", " ")}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {isPersonaMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        Active Account
                      </p>
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[180px]">
                        {user?.email || "Signed In"}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 text-[11px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 px-2 py-1 rounded-lg transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Log Out</span>
                    </button>
                  </div>

                  <div className="p-2 border-b border-neutral-100 dark:border-neutral-800">
                    <Link
                      href="/login"
                      onClick={() => setIsPersonaMenuOpen(false)}
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-xs font-bold transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Login Portal & Registration</span>
                    </Link>
                  </div>

                  <div className="px-3 pt-2 pb-1">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Quick Switch Persona
                    </p>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1">
                    {availablePersonas.map((persona) => (
                      <button
                        key={persona.id}
                        onClick={() => {
                          setIsPersonaMenuOpen(false);
                          switchPersona(persona.id);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-start space-x-3 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors ${
                          user?.id === persona.id ? "bg-orange-50/70 dark:bg-orange-950/30" : ""
                        }`}
                      >
                        <div className="mt-0.5">{getRoleIcon(persona.role)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            {persona.name}
                          </p>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${getRoleBadge(
                                persona.role
                              )}`}
                            >
                              {persona.role.replace("_", " ")}
                            </span>
                            {persona.restaurantStaff?.[0] && (
                              <span className="text-[10px] text-neutral-500 truncate">
                                • {persona.restaurantStaff[0].restaurant.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Login Button */}
            <Link
              href="/login"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800 bg-orange-50/80 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-bold transition-all shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login / Join</span>
            </Link>

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
