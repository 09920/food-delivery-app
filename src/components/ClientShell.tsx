"use client";

import React, { useState, useEffect } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { WifiOff, ShieldCheck, Heart } from "lucide-react";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Register PWA service worker if supported
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
          {/* Offline Notice Banner */}
          {!isOnline && (
            <div className="bg-amber-600 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span>You are currently offline. Showing cached content. Online payments and live status require an active connection.</span>
            </div>
          )}

          <Navbar onOpenCart={() => setIsCartOpen(true)} />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>

          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

          {/* Footer */}
          <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-8 px-4 text-xs text-neutral-500">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-neutral-800 dark:text-neutral-200">
                  OFDS
                </span>
                <span>• Production Online Food Delivery System</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> FSSAI Verified Kitchens
                </span>
                <span>• Strict Integer Paise Financial Engine</span>
                <span>• DPDP Act Privacy Compliant</span>
              </div>
            </div>
          </footer>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
