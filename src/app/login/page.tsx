"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UtensilsCrossed,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Bike,
  Store,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  // Mode: "customer_otp" (default Swiggy/Zomato flow) | "partner_portal"
  const [authMode, setAuthMode] = useState<"customer_otp" | "partner_portal">("customer_otp");

  // Step 1: email entry | Step 2: OTP verification
  const [otpStep, setOtpStep] = useState<"enter_email" | "enter_otp">("enter_email");

  // Customer OTP form states
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Partner form states
  const [partnerIdentifier, setPartnerIdentifier] = useState("");
  const [partnerRole, setPartnerRole] = useState<"RESTAURANT_STAFF" | "RIDER" | "ADMIN">("RESTAURANT_STAFF");
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [partnerRestaurantId, setPartnerRestaurantId] = useState("");
  const [partnerVehicleType, setPartnerVehicleType] = useState("MOTORCYCLE");
  const [partnerLicense, setPartnerLicense] = useState("");
  const [restaurantsList, setRestaurantsList] = useState<{ id: string; name: string }[]>([]);
  const [isPartnerRegistering, setIsPartnerRegistering] = useState(false);

  // Shared state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((data) => {
        if (data.restaurants && data.restaurants.length > 0) {
          setRestaurantsList(data.restaurants);
          setPartnerRestaurantId(data.restaurants[0].id);
        }
      })
      .catch((err) => console.error("Error fetching restaurants:", err));
  }, []);

  // STEP 1: Send OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setIsNewUser(data.isNewUser);
      if (data.existingName) {
        setCustomerName(data.existingName);
      }
      setDevOtpHint(data.devOtp || null);
      setOtpStep("enter_otp");
      setSuccessMsg(`We sent a 6-digit verification code to ${email}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to send verification code. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify OTP and Log In / Register
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    if (isNewUser && !customerName.trim()) {
      setErrorMsg("Please enter your name to complete your profile.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: otpCode.trim(),
          name: customerName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setSuccessMsg(`Welcome, ${data.user.name}! Taking you to restaurants...`);
      setTimeout(() => {
        window.location.href = data.redirectUrl || "/";
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  // Partner Direct Login
  const handlePartnerSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerIdentifier.trim()) {
      setErrorMsg("Please enter your staff or rider email.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: partnerIdentifier }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in to partner portal");
      }

      setSuccessMsg(`Authenticated as ${data.user.name} (${data.user.role}). Redirecting...`);
      setTimeout(() => {
        window.location.href = data.redirectUrl || "/";
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Staff login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Partner Registration
  const handlePartnerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !partnerEmail.trim()) {
      setErrorMsg("Please fill in partner name and email.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: partnerName,
          email: partnerEmail,
          phone: partnerPhone,
          role: partnerRole,
          vehicleType: partnerVehicleType,
          licenseNumber: partnerLicense,
          restaurantId: partnerRole === "RESTAURANT_STAFF" ? partnerRestaurantId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Partner registration failed");
      }

      setSuccessMsg(`Registered successfully! Opening partner dashboard...`);
      setTimeout(() => {
        window.location.href = data.redirectUrl || "/";
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-xl shadow-orange-500/25 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-3xl tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            OFDS
          </span>
        </Link>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mt-2">
          Fast Food & Grocery Delivery
        </p>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 transition-all">
        {/* Messages */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* CUSTOMER OTP LOGIN WORKFLOW (Swiggy / Zomato Pattern) */}
        {authMode === "customer_otp" && (
          <div>
            {otpStep === "enter_email" ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <h1 className="text-xl font-black text-neutral-900 dark:text-neutral-100">
                    Login or Sign up
                  </h1>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Enter your email to receive a secure one-time verification code.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      autoFocus
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                >
                  <span>{isLoading ? "Sending Code..." : "Continue"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-neutral-400">
                    By continuing, you agree to our Terms of Service & Privacy Policy.
                  </p>
                </div>
              </form>
            ) : (
              /* Step 2: OTP Verification */
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep("enter_email");
                      setErrorMsg(null);
                    }}
                    className="flex items-center space-x-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Change Email</span>
                  </button>
                  <span className="text-[11px] text-neutral-400 font-mono">{email}</span>
                </div>

                <div>
                  <h1 className="text-xl font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-orange-500" />
                    Verify with Code
                  </h1>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {email}
                    </span>
                  </p>
                </div>

                {/* Localhost Dev Helper Badge */}
                {devOtpHint && (
                  <div
                    onClick={() => setOtpCode(devOtpHint)}
                    className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors"
                    title="Click to automatically fill code"
                  >
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-bold">Dev Mode OTP:</span>
                      <span className="font-mono font-black text-sm tracking-widest px-1.5 py-0.5 bg-amber-200/70 dark:bg-amber-900 rounded">
                        {devOtpHint}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 underline">
                      Auto-fill
                    </span>
                  </div>
                )}

                {/* If new customer, ask for name */}
                {isNewUser && (
                  <div className="space-y-1.5 animate-in fade-in">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. John Doe"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* 6-digit code entry */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    autoFocus
                    required
                    className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                >
                  <span>{isLoading ? "Verifying..." : "Verify & Continue"}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs text-neutral-500 hover:text-orange-600 font-semibold transition-colors"
                  >
                    Didn&apos;t get a code? Resend
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Toggle for Partner Access */}
            <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("partner_portal");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-semibold text-neutral-500 hover:text-orange-600 transition-colors"
              >
                Restaurant Staff, Rider, or Admin?{" "}
                <span className="text-orange-600 underline">Partner Portals</span>
              </button>
            </div>
          </div>
        )}

        {/* PARTNER PORTAL WORKFLOW (Staff, Rider, Admin) */}
        {authMode === "partner_portal" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("customer_otp");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="flex items-center space-x-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Customer Login</span>
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                Partner Hub
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Partner & Staff Access
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Sign in to manage kitchen orders, delivery routes, or platform operations.
              </p>
            </div>

            <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsPartnerRegistering(false)}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  !isPartnerRegistering
                    ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs"
                    : "text-neutral-500"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsPartnerRegistering(true)}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  isPartnerRegistering
                    ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs"
                    : "text-neutral-500"
                }`}
              >
                Onboard Partner
              </button>
            </div>

            {!isPartnerRegistering ? (
              <form onSubmit={handlePartnerSignIn} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Partner Email or Phone
                  </label>
                  <input
                    type="text"
                    value={partnerIdentifier}
                    onChange={(e) => setPartnerIdentifier(e.target.value)}
                    placeholder="e.g. vikram@royalspice.com or amit.rider@example.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 font-bold text-xs shadow-md transition-all"
                >
                  {isLoading ? "Signing In..." : "Open Partner Dashboard"}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePartnerRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Partner Type
                  </label>
                  <select
                    value={partnerRole}
                    onChange={(e) => setPartnerRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold"
                  >
                    <option value="RESTAURANT_STAFF">Restaurant Kitchen / Staff</option>
                    <option value="RIDER">Delivery Rider</option>
                    <option value="ADMIN">Platform Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                    placeholder="Partner Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                    placeholder="email@domain.com"
                  />
                </div>

                {partnerRole === "RESTAURANT_STAFF" && (
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Assigned Restaurant
                    </label>
                    <select
                      value={partnerRestaurantId}
                      onChange={(e) => setPartnerRestaurantId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold"
                    >
                      {restaurantsList.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {partnerRole === "RIDER" && (
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Vehicle Type
                    </label>
                    <select
                      value={partnerVehicleType}
                      onChange={(e) => setPartnerVehicleType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold"
                    >
                      <option value="MOTORCYCLE">Motorcycle</option>
                      <option value="SCOOTER">Scooter</option>
                      <option value="EV_BIKE">EV Bike</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
                >
                  {isLoading ? "Creating Account..." : "Register Partner Profile"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
