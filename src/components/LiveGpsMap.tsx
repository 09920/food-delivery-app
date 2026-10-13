"use client";

import React, { useState, useEffect } from "react";
import { Bike, MapPin, Store, Home, Compass, Navigation2, CheckCircle2, RefreshCw } from "lucide-react";

interface LiveGpsMapProps {
  status: string;
  restaurantName: string;
  restaurantAddress: string;
  deliveryAddress: string;
  riderName?: string;
  riderVehicle?: string;
  estimatedMinutes?: number;
}

export default function LiveGpsMap({
  status,
  restaurantName,
  restaurantAddress,
  deliveryAddress,
  riderName = "Assigned Rider",
  riderVehicle = "Electric Scooter",
  estimatedMinutes = 20,
}: LiveGpsMapProps) {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    if (status === "PLACED" || status === "ACCEPTED" || status === "PREPARING") {
      setProgress(5);
    } else if (status === "READY") {
      setProgress(18);
    } else if (status === "PICKED_UP") {
      // Simulate live forward movement between 25% and 85%
      setProgress(40);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 88) return 40;
          return prev + 3;
        });
      }, 1500);
      return () => clearInterval(interval);
    } else if (status === "DELIVERED") {
      setProgress(100);
    }
  }, [status]);

  // SVG route path coordinates
  // Start: (60, 60), Waypoints: (160, 80), (220, 150), (320, 130), (420, 200), End: (500, 220)
  const pathD = "M 70 70 C 160 50, 190 140, 260 130 C 330 120, 380 210, 490 200";

  // Approximate coordinate mapping along the curve based on progress 0-100%
  const getCoordinatesAlongPath = (p: number) => {
    const t = Math.max(0, Math.min(100, p)) / 100;
    // Cubic bezier interpolation approximation
    const x = (1 - t) * (1 - t) * 70 + 2 * (1 - t) * t * 260 + t * t * 490;
    const y = (1 - t) * (1 - t) * 70 + 2 * (1 - t) * t * 130 + t * t * 200;
    return { x, y };
  };

  const riderPos = getCoordinatesAlongPath(progress);

  return (
    <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-950 text-white overflow-hidden shadow-xl relative">
      {/* Top HUD Header */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-neutral-900/80 border-b border-neutral-800/80 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
            <Navigation2 className="w-4 h-4 transform rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black tracking-wide text-neutral-100 uppercase">
                Live GPS Satellite Route
              </h3>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                TELEMETRY ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {status === "PICKED_UP"
                ? `${riderName} is en route (${riderVehicle})`
                : status === "DELIVERED"
                ? "Doorstep arrival confirmed"
                : "Tracking route preparation"}
            </p>
          </div>
        </div>

        {/* Real-time stats */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="px-2.5 py-1 rounded-xl bg-neutral-800 border border-neutral-700/80 flex items-center gap-1.5">
            <span className="text-neutral-400">ETA:</span>
            <span className="text-orange-400 font-bold">
              {status === "DELIVERED" ? "0m" : `~${estimatedMinutes}m`}
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-neutral-800 border border-neutral-700/80 flex items-center gap-1.5">
            <span className="text-neutral-400">Speed:</span>
            <span className="text-neutral-200 font-bold">
              {status === "PICKED_UP" ? "28 km/h" : "0 km/h"}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Map Visual Stage */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#0d1117]">
        {/* Subtle Map Grid Network Lines */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Secondary decorative street paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 560 260" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Street Grid */}
          <line x1="20" y1="110" x2="540" y2="110" stroke="#1f2937" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="20" y1="180" x2="540" y2="180" stroke="#1f2937" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="140" y1="20" x2="140" y2="240" stroke="#1f2937" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="380" y1="20" x2="380" y2="240" stroke="#1f2937" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Outer Route Halo */}
          <path
            d={pathD}
            fill="none"
            stroke="#f97316"
            strokeWidth="10"
            strokeOpacity="0.15"
            strokeLinecap="round"
          />

          {/* Main Active Route Line with dash animation */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="8 6"
            className={status === "PICKED_UP" ? "animate-pulse" : ""}
          />
        </svg>

        {/* Restaurant Pin Marker */}
        <div className="absolute top-[50px] left-[45px] sm:left-[55px] z-20 flex flex-col items-center">
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/40 ring-4 ring-orange-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-neutral-900/90 text-[10px] font-bold text-white border border-neutral-700 whitespace-nowrap shadow-md">
              {restaurantName}
            </div>
          </div>
        </div>

        {/* Customer Destination Pin Marker */}
        <div className="absolute top-[175px] right-[40px] sm:right-[55px] z-20 flex flex-col items-center">
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 ring-4 ring-emerald-500/20">
              <Home className="w-5 h-5" />
            </div>
            <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-neutral-900/90 text-[10px] font-bold text-emerald-400 border border-neutral-700 whitespace-nowrap shadow-md">
              Delivery Dropstep
            </div>
          </div>
        </div>

        {/* Moving Delivery Scooter Rider Marker */}
        <div
          className="absolute z-30 transition-all duration-1000 ease-out transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${(riderPos.x / 560) * 100}%`,
            top: `${(riderPos.y / 260) * 100}%`,
          }}
        >
          <div className="relative flex items-center justify-center">
            {/* Pulsing ring */}
            <div className="absolute w-12 h-12 rounded-full bg-blue-500/30 animate-ping" />
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/50 ring-2 ring-white">
              {status === "DELIVERED" ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : (
                <Bike className="w-5 h-5 text-white animate-bounce" />
              )}
            </div>
            {/* Floating Tag */}
            <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-blue-900/90 text-white text-[9px] font-mono font-bold whitespace-nowrap border border-blue-400/30">
              {status === "DELIVERED" ? "Arrived" : `${progress}%`}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info Bar */}
      <div className="p-3.5 bg-neutral-900/90 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-400 gap-2">
        <div className="flex items-center gap-2 truncate">
          <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
          <span className="truncate">{deliveryAddress || "Home, Bandra West, Mumbai"}</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500 shrink-0">
          <span>Simulation GPS v2.4</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">100% Signal</span>
        </div>
      </div>
    </div>
  );
}
