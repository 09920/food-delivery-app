"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatDateTime } from "@/lib/formatters";
import { useAuth } from "@/context/AuthContext";
import {
  LifeBuoy,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  MessageSquare,
} from "lucide-react";

interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  category: string;
  status: string;
  priority: string;
  subject: string;
  description: string;
  resolution?: string | null;
  createdAt: string;
}

export default function CustomerSupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [category, setCategory] = useState("MISSING_ITEM");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/support");
      const data = await res.json();
      if (data.tickets) setTickets(data.tickets);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    setIsSubmitting(true);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject, description }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Ticket ${data.ticket.ticketNumber} created successfully! Our ops team will review it.`);
        setIsCreating(false);
        setSubject("");
        setDescription("");
        await fetchTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-orange-500" />
            Customer Support & Dispute Desk
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Report missing items, packaging issues, or payment queries.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20"
        >
          <Plus className="w-4 h-4" /> {isCreating ? "Cancel" : "Open New Dispute Ticket"}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Ticket creation form */}
      {isCreating && (
        <form
          onSubmit={handleCreateTicket}
          className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border-2 border-orange-500/40 shadow-xl space-y-4"
        >
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Submit a Dispute or Help Request
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-neutral-500">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800"
              >
                <option value="MISSING_ITEM">Missing Item in Order</option>
                <option value="INCORRECT_ORDER">Incorrect Dish Delivered</option>
                <option value="DELAYED_DELIVERY">Delayed Delivery / Cold Food</option>
                <option value="PAYMENT_ISSUE">Payment Charged but Order Not Confirmed</option>
                <option value="CANCELLATION">Cancellation / Refund Inquiry</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-500">Subject Summary</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Garlic Naan missing from order package"
                className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-neutral-500">Detailed Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred with your order..."
              className="w-full mt-1 p-2.5 text-xs border rounded-xl bg-neutral-50 dark:bg-neutral-800"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors shadow-md shadow-orange-600/20"
          >
            {isSubmitting ? "Submitting..." : "Submit Ticket to Support"}
          </button>
        </form>
      )}

      {/* Ticket List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          Your Support History ({tickets.length})
        </h2>

        {tickets.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800">
            <HelpCircle className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
            <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
              No support tickets found
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Have an issue with your delivery? Click the button above to open a ticket.
            </p>
          </div>
        ) : (
          tickets.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
                    {t.ticketNumber}
                  </span>
                  <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    {t.subject}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    t.status === "RESOLVED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                "{t.description}"
              </p>

              {t.resolution && (
                <div className="mt-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                  <strong>Resolution from Ops Team:</strong> {t.resolution}
                </div>
              )}

              <p className="text-[10px] text-neutral-400 mt-1">
                Submitted on {formatDateTime(t.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
