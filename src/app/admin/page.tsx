"use client";

import React, { useState, useEffect } from "react";
import { formatPaiseToRupees, formatDateTime } from "@/lib/formatters";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  TrendingUp,
  Store,
  Bike,
  LifeBuoy,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  ExternalLink,
  RotateCcw,
  UserPlus,
  PlusCircle,
  Sparkles,
  Bot,
  Power,
  Clock,
  Zap,
} from "lucide-react";

interface AdminData {
  metrics: {
    totalOrdersCount: number;
    grossOrderValuePaise: number;
    platformCommissionPaise: number;
    activeOrdersCount: number;
    statusCounts: Record<string, number>;
  };
  restaurants: {
    id: string;
    name: string;
    fssaiLicense: string;
    city: string;
    isOpen: boolean;
    isApproved: boolean;
    rating: number;
    _count: { orders: number; menuItems: number };
  }[];
  riders: {
    id: string;
    userId: string;
    vehicleType: string;
    licenseNumber: string;
    isAvailable: boolean;
    user: { name: string; phone: string };
  }[];
  supportTickets: {
    id: string;
    ticketNumber: string;
    category: string;
    status: string;
    priority: string;
    subject: string;
    description: string;
    createdAt: string;
    user: { name: string; email: string };
  }[];
  auditLogs: {
    id: string;
    actorRole: string;
    action: string;
    resource: string;
    createdAt: string;
    metadata?: string;
  }[];
}

export default function PlatformAdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminData | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "restaurants" | "riders" | "tickets" | "audit" | "onboarding"
  >("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Auto-Pilot Simulation Bot State
  const [botConfig, setBotConfig] = useState<{ enabled: boolean; delaySeconds: number }>({
    enabled: true,
    delaySeconds: 6,
  });
  const [isUpdatingBot, setIsUpdatingBot] = useState(false);

  // Manual Onboarding State
  const [onboardType, setOnboardType] = useState<"restaurant" | "rider" | "user">("restaurant");
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardStatus, setOnboardStatus] = useState<{ message: string; isError: boolean } | null>(null);

  const [restForm, setRestForm] = useState({
    name: "",
    cuisineTypes: "North Indian, Biryani, Mughlai",
    fssaiLicense: "",
    address: "",
    city: "Mumbai",
    phone: "",
    deliveryRadiusKm: "10",
    averagePreparationMinutes: "25",
    ownerEmail: "",
    ownerName: "",
  });

  const [riderForm, setRiderForm] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleType: "MOTORCYCLE",
    licenseNumber: "",
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "CUSTOMER",
  });

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOnboarding(true);
    setOnboardStatus(null);

    let payload: any = { type: onboardType };
    if (onboardType === "restaurant") {
      payload = { ...payload, ...restForm };
    } else if (onboardType === "rider") {
      payload = { ...payload, ...riderForm };
    } else if (onboardType === "user") {
      payload = { ...payload, ...userForm };
    }

    try {
      const res = await fetch("/api/admin/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to onboard");
      }

      setOnboardStatus({ message: resData.message || "Successfully created!", isError: false });
      // Reset forms
      if (onboardType === "restaurant") {
        setRestForm({
          name: "",
          cuisineTypes: "North Indian, Biryani, Mughlai",
          fssaiLicense: "",
          address: "",
          city: "Mumbai",
          phone: "",
          deliveryRadiusKm: "10",
          averagePreparationMinutes: "25",
          ownerEmail: "",
          ownerName: "",
        });
      } else if (onboardType === "rider") {
        setRiderForm({
          name: "",
          email: "",
          phone: "",
          vehicleType: "MOTORCYCLE",
          licenseNumber: "",
        });
      } else if (onboardType === "user") {
        setUserForm({
          name: "",
          email: "",
          phone: "",
          role: "CUSTOMER",
        });
      }

      await fetchAdminData();
    } catch (err: any) {
      setOnboardStatus({ message: err.message || "Failed to onboard", isError: true });
    } finally {
      setIsOnboarding(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (json.metrics) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBotConfig = async () => {
    try {
      const res = await fetch("/api/admin/bot");
      const json = await res.json();
      if (typeof json.enabled === "boolean") {
        setBotConfig(json);
      }
    } catch (e) {
      console.error("Failed to fetch bot config:", e);
    }
  };

  const updateBotConfig = async (newConfig: { enabled?: boolean; delaySeconds?: number }) => {
    setIsUpdatingBot(true);
    try {
      const res = await fetch("/api/admin/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      const json = await res.json();
      if (json.success && json.config) {
        setBotConfig(json.config);
      }
    } catch (e) {
      console.error("Failed to update bot config:", e);
    } finally {
      setIsUpdatingBot(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchBotConfig();
  }, []);

  const handleToggleRestaurantApproval = async (restaurantId: string, currentApproved: boolean) => {
    if (
      !window.confirm(
        `Are you sure you want to ${currentApproved ? "suspend" : "approve"} this restaurant partner?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/admin/restaurants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, isApproved: !currentApproved }),
      });
      const resData = await res.json();
      if (resData.success) {
        await fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    const resolution = prompt("Enter resolution notes for customer dispute:", "Issue reviewed and resolved by Ops Administrator.");
    if (!resolution) return;

    try {
      const res = await fetch("/api/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status: "RESOLVED", resolution }),
      });
      const resData = await res.json();
      if (resData.success) {
        await fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportFinancialReport = () => {
    if (!data) return;
    const content = `METRIC,VALUE
Total Orders,${data.metrics.totalOrdersCount}
Gross Order Value (Paise),${data.metrics.grossOrderValuePaise}
Gross Order Value (INR),${(data.metrics.grossOrderValuePaise / 100).toFixed(2)}
Platform Commission (INR),${(data.metrics.platformCommissionPaise / 100).toFixed(2)}
Active Orders,${data.metrics.activeOrdersCount}
Generated At,${new Date().toISOString()}
`;
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `platform_operations_kpi_${Date.now()}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse py-8">
        <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold">Admin Privileges Required</h2>
        <p className="text-xs text-neutral-500 mt-1">Switch to the Platform Administrator persona using the top-right role switcher.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-purple-500/10 dark:bg-purple-950/20 border border-purple-300 dark:border-purple-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
              Platform Operations & Governance
            </h1>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Logged in as Super Admin: <span className="font-bold text-neutral-900 dark:text-neutral-100">{user?.name}</span>
          </p>
        </div>

        <button
          onClick={exportFinancialReport}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20"
        >
          <Download className="w-3.5 h-3.5" /> Export Financial Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
            Gross Order Value (GOV)
          </p>
          <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
            {formatPaiseToRupees(data.metrics.grossOrderValuePaise)}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Across {data.metrics.totalOrdersCount} customer orders
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
            Platform Commission
          </p>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {formatPaiseToRupees(data.metrics.platformCommissionPaise)}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">
            15% Take-rate + Convenience fees
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
            Active Deliveries
          </p>
          <p className="text-2xl font-black text-orange-600 mt-1">
            {data.metrics.activeOrdersCount}
          </p>
          <p className="text-[11px] text-orange-600 font-semibold mt-1">
            In-flight / Kitchen prep
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
            Kitchen Partners
          </p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {data.restaurants.length}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">
            100% FSSAI verified
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        {[
          { key: "overview", label: "Operations Overview" },
          { key: "restaurants", label: `Restaurants (${data.restaurants.length})` },
          { key: "riders", label: `Rider Fleet (${data.riders.length})` },
          { key: "tickets", label: `Customer Disputes (${data.supportTickets.length})` },
          { key: "audit", label: `Audit Trail (${data.auditLogs.length})` },
          { key: "onboarding", label: "✨ Manual Onboard (+ Add)" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.key
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview (Status breakdown) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Auto-Pilot Simulation Bot Control Panel */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-pink-900/10 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-pink-950/30 border-2 border-indigo-500/30 dark:border-indigo-500/40 shadow-xl space-y-6 relative overflow-hidden backdrop-blur-md">
            {/* Ambient decorative glow */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                  botConfig.enabled
                    ? "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-indigo-500/30"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                }`}>
                  <Bot className={`w-6 h-6 ${botConfig.enabled ? "animate-pulse" : ""}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
                      Auto-Pilot Order Simulation Bot
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      botConfig.enabled
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                    }`}>
                      {botConfig.enabled ? "● RUNNING" : "○ STOPPED"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                    Automatically simulates the complete customer order delivery lifecycle (Kitchen Acceptance ➔ Cooking ➔ Packaging ➔ Rider Pickup ➔ OTP Handover) with realistic time delays.
                  </p>
                </div>
              </div>

              {/* Master ON/OFF Switch */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  disabled={isUpdatingBot}
                  onClick={() => updateBotConfig({ enabled: !botConfig.enabled })}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-black tracking-wide uppercase transition-all shadow-md ${
                    botConfig.enabled
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/50"
                      : "bg-neutral-700 hover:bg-neutral-800 text-white shadow-neutral-700/20"
                  } disabled:opacity-50`}
                >
                  <Power className="w-4 h-4" />
                  {botConfig.enabled ? "Bot Active (ON)" : "Bot Inactive (OFF)"}
                </button>
              </div>
            </div>

            {/* Pacing Speed & Simulation Stepper */}
            <div className="pt-4 border-t border-neutral-200/60 dark:border-neutral-800/80 flex flex-col md:flex-row md:items-center justify-between gap-5">
              {/* Pacing Selector */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Step Transition Interval:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-extrabold">{botConfig.delaySeconds} seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { label: "⚡ 5s (Fast Demo)", sec: 5 },
                    { label: "🔥 7s (Standard)", sec: 7 },
                    { label: "⏱️ 10s (Detailed)", sec: 10 },
                  ].map((preset) => (
                    <button
                      key={preset.sec}
                      type="button"
                      disabled={isUpdatingBot}
                      onClick={() => updateBotConfig({ delaySeconds: preset.sec })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        botConfig.delaySeconds === preset.sec
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                          : "bg-white/80 dark:bg-neutral-800 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bot Step Sequence Preview */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-neutral-500">
                <span className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700">1. Placed</span>
                <span>➔</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700">2. Kitchen Accept</span>
                <span>➔</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700">3. Cooking</span>
                <span>➔</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700">4. Packed</span>
                <span>➔</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700">5. Rider Pickup</span>
                <span>➔</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">6. OTP Handover ✅</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Orders Status Breakdown
            </h2>
            <div className="space-y-3 text-xs">
              {Object.entries(data.metrics.statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">
                    {status}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 font-mono font-bold">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              System Health & Gateway Status
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <span className="font-bold text-emerald-900 dark:text-emerald-200">
                  Prisma Database (PostgreSQL / SQLite)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">
                  HEALTHY
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <span className="font-bold text-emerald-900 dark:text-emerald-200">
                  Razorpay Payments Webhook Engine
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">
                  ACTIVE
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <span className="font-bold text-emerald-900 dark:text-emerald-200">
                  Real-time SSE Live GPS Stream
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">
                  ONLINE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Tab: Restaurants Management */}
      {activeTab === "restaurants" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            Kitchen Partner Verification & FSSAI Compliance
          </h2>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {data.restaurants.map((rest) => (
              <div key={rest.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    {rest.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    FSSAI License: <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{rest.fssaiLicense}</span> • {rest.city}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {rest._count.menuItems} menu dishes • {rest._count.orders} orders processed
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      rest.isApproved
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {rest.isApproved ? "Approved" : "Suspended"}
                  </span>

                  <button
                    onClick={() => handleToggleRestaurantApproval(rest.id, rest.isApproved)}
                    className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold hover:bg-neutral-100 transition-colors"
                  >
                    {rest.isApproved ? "Suspend" : "Approve Partner"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Riders Fleet */}
      {activeTab === "riders" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            Registered Delivery Partners
          </h2>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {data.riders.map((rider) => (
              <div key={rider.id} className="py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    {rider.user.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {rider.vehicleType} • DL: {rider.licenseNumber} • Phone: {rider.user.phone}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    rider.isAvailable
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {rider.isAvailable ? "Online & Ready" : "Offline"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Disputes & Support Tickets */}
      {activeTab === "tickets" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            Customer Disputes & Support Tickets
          </h2>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {data.supportTickets.map((ticket) => (
              <div key={ticket.id} className="py-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
                      {ticket.ticketNumber}
                    </span>
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {ticket.subject}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                        ticket.status === "RESOLVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    "{ticket.description}"
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Submitted by: {ticket.user.name} ({ticket.user.email}) • {formatDateTime(ticket.createdAt)}
                  </p>
                </div>

                {ticket.status !== "RESOLVED" && (
                  <button
                    onClick={() => handleResolveTicket(ticket.id)}
                    className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow"
                  >
                    Resolve Dispute
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Audit Trail */}
      {activeTab === "audit" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            System Security & Operations Audit Logs
          </h2>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {data.auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-purple-600">{log.action}</span> on{" "}
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {log.resource}
                  </span>
                  {log.metadata && (
                    <span className="text-neutral-400 font-mono text-[10px] ml-2">
                      {log.metadata}
                    </span>
                  )}
                </div>
                <div className="text-right text-neutral-400">
                  <span className="font-semibold">{log.actorRole}</span> • {formatDateTime(log.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Manual Onboarding (Web Interface) */}
      {activeTab === "onboarding" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
                Manual Entity Onboarding Interface
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Add new restaurants, delivery riders, or system users manually straight into the live database.
            </p>
          </div>

          {/* Sub-selector */}
          <div className="flex space-x-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 max-w-md">
            <button
              type="button"
              onClick={() => {
                setOnboardType("restaurant");
                setOnboardStatus(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                onboardType === "restaurant"
                  ? "bg-white dark:bg-neutral-900 text-purple-600 dark:text-purple-300 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
              }`}
            >
              + Restaurant Partner
            </button>
            <button
              type="button"
              onClick={() => {
                setOnboardType("rider");
                setOnboardStatus(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                onboardType === "rider"
                  ? "bg-white dark:bg-neutral-900 text-purple-600 dark:text-purple-300 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
              }`}
            >
              + Delivery Rider
            </button>
            <button
              type="button"
              onClick={() => {
                setOnboardType("user");
                setOnboardStatus(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                onboardType === "user"
                  ? "bg-white dark:bg-neutral-900 text-purple-600 dark:text-purple-300 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
              }`}
            >
              + Any User
            </button>
          </div>

          {/* Status Alert */}
          {onboardStatus && (
            <div
              className={`p-4 rounded-2xl border text-xs font-semibold flex items-center space-x-2 ${
                onboardStatus.isError
                  ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                  : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              }`}
            >
              {onboardStatus.isError ? (
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{onboardStatus.message}</span>
            </div>
          )}

          {/* FORM: RESTAURANT */}
          {onboardType === "restaurant" && (
            <form onSubmit={handleOnboardSubmit} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bombay Tawa Grill"
                    value={restForm.name}
                    onChange={(e) => setRestForm({ ...restForm, name: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Cuisine Types
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mughlai, Rolls, Street Food"
                    value={restForm.cuisineTypes}
                    onChange={(e) => setRestForm({ ...restForm, cuisineTypes: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    FSSAI License
                  </label>
                  <input
                    type="text"
                    placeholder="14-digit FSSAI (Auto if blank)"
                    value={restForm.fssaiLicense}
                    onChange={(e) => setRestForm({ ...restForm, fssaiLicense: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Phone Contact
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98200 12345"
                    value={restForm.phone}
                    onChange={(e) => setRestForm({ ...restForm, phone: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={restForm.city}
                    onChange={(e) => setRestForm({ ...restForm, city: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  placeholder="Plot 4, Hill Road, Bandra West"
                  value={restForm.address}
                  onChange={(e) => setRestForm({ ...restForm, address: e.target.value })}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-3">
                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Optional: Link Kitchen Staff / Owner Account
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
                      Staff / Manager Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kulkarni"
                      value={restForm.ownerName}
                      onChange={(e) => setRestForm({ ...restForm, ownerName: e.target.value })}
                      className="w-full py-2 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
                      Staff Email (for logging into kitchen)
                    </label>
                    <input
                      type="email"
                      placeholder="ramesh@partner.com"
                      value={restForm.ownerEmail}
                      onChange={(e) => setRestForm({ ...restForm, ownerEmail: e.target.value })}
                      className="w-full py-2 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isOnboarding}
                className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all disabled:opacity-60"
              >
                {isOnboarding ? "Onboarding Partner..." : "Create & Launch Restaurant Partner"}
              </button>
            </form>
          )}

          {/* FORM: RIDER */}
          {onboardType === "rider" && (
            <form onSubmit={handleOnboardSubmit} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Rider Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suraj Shinde"
                    value={riderForm.name}
                    onChange={(e) => setRiderForm({ ...riderForm, name: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="suraj.rider@example.com"
                    value={riderForm.email}
                    onChange={(e) => setRiderForm({ ...riderForm, email: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 97654 32109"
                    value={riderForm.phone}
                    onChange={(e) => setRiderForm({ ...riderForm, phone: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={riderForm.vehicleType}
                    onChange={(e) => setRiderForm({ ...riderForm, vehicleType: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="MOTORCYCLE">Motorcycle</option>
                    <option value="SCOOTER">Scooter</option>
                    <option value="EV_BIKE">EV Bike</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Driving License
                  </label>
                  <input
                    type="text"
                    placeholder="DL-MH-01202399"
                    value={riderForm.licenseNumber}
                    onChange={(e) => setRiderForm({ ...riderForm, licenseNumber: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isOnboarding}
                className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all disabled:opacity-60"
              >
                {isOnboarding ? "Onboarding Rider..." : "Add Rider to Fleet"}
              </button>
            </form>
          )}

          {/* FORM: GENERAL USER */}
          {onboardType === "user" && (
            <form onSubmit={handleOnboardSubmit} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Neha Gupta"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="neha@example.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98989 89898"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="RESTAURANT_STAFF">Restaurant Staff</option>
                    <option value="RIDER">Delivery Rider</option>
                    <option value="ADMIN">Platform Admin</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isOnboarding}
                className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all disabled:opacity-60"
              >
                {isOnboarding ? "Creating User..." : "Create User"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
