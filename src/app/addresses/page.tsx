"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Home,
  Briefcase,
  Check,
  Building,
  Trash2,
  AlertTriangle,
  Loader2,
  X,
  Star,
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
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [label, setLabel] = useState("Home");
  const [addressLine, setAddressLine] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("400050");
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deletion modal state
  const [addressToDelete, setAddressToDelete] = useState<SavedAddress | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingDefaultId, setUpdatingDefaultId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/customer/addresses");
      const data = await res.json();
      if (data.addresses) setAddresses(data.addresses);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
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
        showToast("Address saved successfully!");
        await fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/customer/addresses?id=${encodeURIComponent(addressToDelete.id)}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== addressToDelete.id));
        setAddressToDelete(null);
        showToast("Address deleted successfully.");
        // Refresh addresses list to reflect any automatic default promotion
        fetchAddresses();
      } else {
        alert(data.error || "Failed to delete address");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting address");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    setUpdatingDefaultId(id);
    try {
      const res = await fetch("/api/customer/addresses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDefault: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }))
        );
        showToast("Default address updated.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingDefaultId(null);
    }
  };

  const getLabelIcon = (lbl: string) => {
    if (lbl.toLowerCase().includes("home"))
      return <Home className="w-4 h-4 text-orange-500" />;
    if (lbl.toLowerCase().includes("work"))
      return <Briefcase className="w-4 h-4 text-blue-500" />;
    return <Building className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold rounded-2xl shadow-xl border border-neutral-700/30 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
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
          {isAdding ? (
            <>
              <X className="w-4 h-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Add Address
            </>
          )}
        </button>
      </div>

      {/* Add Address Form */}
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
                className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-700"
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
                className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-700"
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
              className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-700"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-neutral-500">Landmark (Optional)</label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Near station, behind mall..."
              className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="defCheck"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="text-orange-600 focus:ring-orange-500 rounded"
            />
            <label htmlFor="defCheck" className="text-xs font-semibold cursor-pointer text-neutral-800 dark:text-neutral-200">
              Set as Default Delivery Address
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors shadow-md shadow-orange-600/20 disabled:opacity-60 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Delivery Address"}
          </button>
        </form>
      )}

      {/* Empty State */}
      {!isLoading && addresses.length === 0 && !isAdding && (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center mx-auto">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            No Saved Addresses
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            You don't have any saved delivery addresses. Add your home or office address to place orders faster.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </div>
      )}

      {/* Address cards list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  {getLabelIcon(addr.label)}
                  {addr.label}
                </span>

                <div className="flex items-center gap-1.5">
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/30">
                      Default
                    </span>
                  )}
                  <button
                    onClick={() => setAddressToDelete(addr)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 font-medium">
                {addr.addressLine}
              </p>
              {addr.landmark && (
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Landmark: {addr.landmark}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <p className="text-[11px] text-neutral-400">
                {addr.city} • PIN: {addr.pincode}
              </p>

              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  disabled={updatingDefaultId === addr.id}
                  className="text-[11px] font-semibold text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1 disabled:opacity-50"
                  title="Make this your default delivery address"
                >
                  {updatingDefaultId === addr.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Star className="w-3 h-3" />
                  )}
                  Set Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {addressToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Delete Address?
                </h3>
                <p className="text-xs text-neutral-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300">
              <span className="font-bold flex items-center gap-1 text-neutral-900 dark:text-neutral-100 mb-1">
                {getLabelIcon(addressToDelete.label)}
                {addressToDelete.label}
                {addressToDelete.isDefault && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 ml-1">
                    Default
                  </span>
                )}
              </span>
              <p className="truncate text-neutral-600 dark:text-neutral-400">
                {addressToDelete.addressLine}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {addressToDelete.city} • PIN: {addressToDelete.pincode}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAddress}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20 disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Delete Address
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
