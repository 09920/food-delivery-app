"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Home,
  Briefcase,
  Check,
  Building,
} from "lucide-react";

interface SavedAddress {
  id: string;
  label: string;
  addressLine: string;
  landmark?: string | null;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [label, setLabel] = useState("Home");
  const [addressLine, setAddressLine] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("400050");
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/customer/addresses");
      const data = await res.json();
      if (data.addresses) setAddresses(data.addresses);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine || !pincode) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          addressLine,
          landmark,
          city: "Mumbai",
          pincode,
          isDefault,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdding(false);
        setAddressLine("");
        setLandmark("");
        await fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLabelIcon = (lbl: string) => {
    if (lbl.toLowerCase().includes("home")) return <Home className="w-4 h-4 text-orange-500" />;
    if (lbl.toLowerCase().includes("work")) return <Briefcase className="w-4 h-4 text-blue-500" />;
    return <Building className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-orange-500" />
            Saved Delivery Addresses
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your default residential, workplace, and friend addresses.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20"
        >
          <Plus className="w-4 h-4" /> {isAdding ? "Cancel" : "Add Address"}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAddAddress}
          className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border-2 border-orange-500/40 shadow-xl space-y-4"
        >
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Save New Delivery Address
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-neutral-500">Address Label</label>
              <select
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500">Pincode</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-neutral-500">Complete Address</label>
            <input
              type="text"
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="Flat no., Building name, Street"
              className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-neutral-500">Landmark (Optional)</label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Near station, behind mall..."
              className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="defCheck"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="defCheck" className="text-xs font-semibold cursor-pointer">
              Set as Default Delivery Address
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors shadow-md shadow-orange-600/20"
          >
            {isSubmitting ? "Saving..." : "Save Delivery Address"}
          </button>
        </form>
      )}

      {/* Address cards list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  {getLabelIcon(addr.label)}
                  {addr.label}
                </span>
                {addr.isDefault && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Default
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                {addr.addressLine}
              </p>
              {addr.landmark && (
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Landmark: {addr.landmark}
                </p>
              )}
            </div>

            <p className="text-[11px] text-neutral-400 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              {addr.city} • PIN: {addr.pincode}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
