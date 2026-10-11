"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UtensilsCrossed,
  User,
  Bike,
  ShieldCheck,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Store,
  ChevronRight,
  Info,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");

  // Sign-in states
  const [identifier, setIdentifier] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regRole, setRegRole] = useState<"CUSTOMER" | "RESTAURANT_STAFF" | "RIDER">("CUSTOMER");
  const [regVehicleType, setRegVehicleType] = useState("MOTORCYCLE");
  const [regLicense, setRegLicense] = useState("");
  const [regRestaurantId, setRegRestaurantId] = useState("");
  const [restaurantsList, setRestaurantsList] = useState<{ id: string; name: string }[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load restaurants for staff registration dropdown
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((data) => {
        if (data.restaurants) {
          setRestaurantsList(data.restaurants);
          if (data.restaurants.length > 0) {
            setRegRestaurantId(data.restaurants[0].id);
          }
        }
      })
      .catch((err) => console.error("Error fetching restaurants:", err));
  }, []);

  const handleSignIn = async (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const loginId = customId || identifier;

    if (!loginId.trim()) {
      setLoginError("Please enter your email or phone number.");
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      setSuccessMessage(`Welcome back, ${data.user.name}! Redirecting...`);
      setTimeout(() => {
        window.location.href = data.redirectUrl || "/";
      }, 700);
    } catch (err: any) {
      setLoginError(err.message || "Something went wrong");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setRegisterError("Please fill in your name and email.");
      return;
    }

    setIsRegistering(true);
    setRegisterError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          role: regRole,
          vehicleType: regVehicleType,
          licenseNumber: regLicense,
          restaurantId: regRole === "RESTAURANT_STAFF" ? regRestaurantId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      setSuccessMessage(`Account created successfully for ${data.user.name}! Directing you to your portal...`);
      setTimeout(() => {
        window.location.href = data.redirectUrl || "/";
      }, 900);
    } catch (err: any) {
      setRegisterError(err.message || "Failed to register account");
    } finally {
      setIsRegistering(false);
    }
  };

  const demoAccounts = [
    {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      role: "Customer",
      icon: <User className="w-4 h-4 text-emerald-600" />,
      color: "border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 dark:bg-emerald-950/30",
      desc: "Browses food, carts items, live OTP tracking",
    },
    {
      name: "Vikram Singhania",
      email: "vikram@royalspice.com",
      role: "Restaurant Staff",
      icon: <UtensilsCrossed className="w-4 h-4 text-amber-600" />,
      color: "border-amber-200 bg-amber-50/70 hover:bg-amber-100 dark:bg-amber-950/30",
      desc: "Manages Royal Spice Kitchen & food prep",
    },
    {
      name: "Amit Kumar",
      email: "amit.rider@example.com",
      role: "Delivery Rider",
      icon: <Bike className="w-4 h-4 text-blue-600" />,
      color: "border-blue-200 bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-950/30",
      desc: "Accepts dispatches, enters OTP, finishes drop",
    },
    {
      name: "Sanjay Mehra",
      email: "admin@ofds-platform.com",
      role: "Platform Admin",
      icon: <ShieldCheck className="w-4 h-4 text-purple-600" />,
      color: "border-purple-200 bg-purple-50/70 hover:bg-purple-100 dark:bg-purple-950/30",
      desc: "Financial analytics, manual onboard & partner approvals",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            OFDS
          </span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight">
          Food Delivery Portal
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Sign in or create a new account for customers, kitchen staff, riders, or platform admin.
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-neutral-900 py-8 px-6 sm:px-10 shadow-xl shadow-neutral-200/50 dark:shadow-neutral-950/50 rounded-3xl border border-neutral-200/80 dark:border-neutral-800">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-neutral-200 dark:border-neutral-800 mb-6">
            <button
              onClick={() => {
                setActiveTab("signin");
                setLoginError(null);
                setRegisterError(null);
              }}
              className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all ${
                activeTab === "signin"
                  ? "border-orange-500 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
              }`}
            >
              Sign In to Account
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setLoginError(null);
                setRegisterError(null);
              }}
              className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all ${
                activeTab === "register"
                  ? "border-orange-500 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
              }`}
            >
              Create New Account
            </button>
          </div>

          {/* Feedback Toasts */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-3 text-emerald-800 dark:text-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-semibold">{successMessage}</p>
            </div>
          )}

          {loginError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center space-x-3 text-red-800 dark:text-red-200 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm font-medium">{loginError}</p>
            </div>
          )}

          {registerError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center space-x-3 text-red-800 dark:text-red-200 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm font-medium">{registerError}</p>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {activeTab === "signin" && (
            <div>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Email Address or Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. rahul@example.com or 9820098200"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-sm transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-orange-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
                >
                  {isLoggingIn ? (
                    <span>Signing In...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Instant 1-Click Demo Presets */}
              <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Instant 1-Click Test Logins
                  </span>
                  <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Quick Switch
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => {
                        setIdentifier(acc.email);
                        handleSignIn(undefined, acc.email);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${acc.color}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1.5 font-bold text-neutral-900 dark:text-neutral-100">
                          {acc.icon}
                          <span className="truncate">{acc.name}</span>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/80 dark:bg-neutral-800 shadow-xs">
                          {acc.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-1">
                        {acc.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER / SIGN UP */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Deshmukh"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Account Type (Role)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole("CUSTOMER")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      regRole === "CUSTOMER"
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/30"
                        : "border-neutral-200 dark:border-neutral-700 text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Customer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole("RESTAURANT_STAFF")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      regRole === "RESTAURANT_STAFF"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/30"
                        : "border-neutral-200 dark:border-neutral-700 text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                    <span>Kitchen Staff</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole("RIDER")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      regRole === "RIDER"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 ring-2 ring-blue-500/30"
                        : "border-neutral-200 dark:border-neutral-700 text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    <span>Delivery Rider</span>
                  </button>
                </div>
              </div>

              {/* Conditional: Rider details */}
              {regRole === "RIDER" && (
                <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-800/60 space-y-3">
                  <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Rider Onboarding Details</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                        Vehicle Type
                      </label>
                      <select
                        value={regVehicleType}
                        onChange={(e) => setRegVehicleType(e.target.value)}
                        className="w-full py-1.5 px-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      >
                        <option value="MOTORCYCLE">Motorcycle</option>
                        <option value="SCOOTER">Scooter</option>
                        <option value="EV_BIKE">Electric Bike (EV)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                        License Number
                      </label>
                      <input
                        type="text"
                        placeholder="DL-MH-492049"
                        value={regLicense}
                        onChange={(e) => setRegLicense(e.target.value)}
                        className="w-full py-1.5 px-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional: Restaurant Staff details */}
              {regRole === "RESTAURANT_STAFF" && (
                <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-2">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Link to Restaurant Outlet</p>
                  <select
                    value={regRestaurantId}
                    onChange={(e) => setRegRestaurantId(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  >
                    {restaurantsList.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-orange-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
              >
                {isRegistering ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom helper note */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs font-medium text-neutral-500 hover:text-orange-600 dark:text-neutral-400 transition-colors"
            >
              ← Back to Discovery Home
            </Link>
          </div>
        </div>

        {/* Feature summary pills */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs text-neutral-600 dark:text-neutral-400">
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
            <p className="font-bold text-neutral-900 dark:text-neutral-100">Customer</p>
            <p className="text-[11px] mt-0.5">Order food & track</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
            <p className="font-bold text-neutral-900 dark:text-neutral-100">Kitchen</p>
            <p className="text-[11px] mt-0.5">Accept & prepare</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
            <p className="font-bold text-neutral-900 dark:text-neutral-100">Rider</p>
            <p className="text-[11px] mt-0.5">Pickup & OTP drop</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
            <p className="font-bold text-neutral-900 dark:text-neutral-100">Admin</p>
            <p className="text-[11px] mt-0.5">Onboard & finance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
