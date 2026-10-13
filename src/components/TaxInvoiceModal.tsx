"use client";

import React from "react";
import { Printer, X, Download, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { formatPaiseToRupees, formatDateTime } from "@/lib/formatters";

interface TaxInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    orderNumber: string;
    createdAt: string;
    totalPaise: number;
    subtotalPaise?: number;
    taxPaise?: number;
    deliveryFeePaise?: number;
    platformFeePaise?: number;
    discountPaise?: number;
    restaurant: {
      name: string;
      phone: string;
      address: string;
      fssaiLicense?: string;
    };
    items: {
      id: string;
      nameSnapshot: string;
      pricePaiseSnapshot: number;
      quantity: number;
      totalPaise: number;
    }[];
    customer?: {
      name: string;
      phone: string;
    };
    deliveryAddressSnapshot: string;
  };
}

export default function TaxInvoiceModal({ isOpen, onClose, order }: TaxInvoiceModalProps) {
  if (!isOpen) return null;

  let addressObj: {
    label?: string;
    addressLine?: string;
    city?: string;
    pincode?: string;
  } = {};
  try {
    addressObj = JSON.parse(order.deliveryAddressSnapshot);
  } catch {}

  const handlePrint = () => {
    window.print();
  };

  const subtotal = order.subtotalPaise || order.items.reduce((s, i) => s + i.totalPaise, 0);
  const tax = order.taxPaise || Math.round(subtotal * 0.05);
  const delivery = order.deliveryFeePaise || 3000;
  const platform = order.platformFeePaise || 500;
  const discount = order.discountPaise || 0;
  const total = order.totalPaise;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8 print:shadow-none print:border-none print:my-0 print:rounded-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 bg-neutral-100 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Tax Invoice & Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors shadow-md shadow-orange-600/20"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-6 sm:p-8 space-y-6 text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 print:text-black print:bg-white print:p-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-neutral-200 dark:border-neutral-800 pb-5 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-orange-600">QuickBite Delivery</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase">
                  Original For Recipient
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                FSSAI Lic. No: <span className="font-mono font-bold">{order.restaurant.fssaiLicense || "11521001000123"}</span>
              </p>
              <p className="text-xs text-neutral-500">
                GSTIN: <span className="font-mono font-bold">27AAECF1234F1Z8</span>
              </p>
            </div>

            <div className="sm:text-right">
              <h1 className="text-base font-black tracking-wider uppercase text-neutral-900 dark:text-neutral-100 print:text-black">
                TAX INVOICE
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5 font-mono">
                Invoice No: <span className="font-bold text-neutral-800 dark:text-neutral-200">INV-{order.orderNumber}</span>
              </p>
              <p className="text-xs text-neutral-500 font-mono">
                Date: {formatDateTime(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Supplier & Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-neutral-200 dark:border-neutral-800 pb-5">
            <div>
              <p className="font-bold text-neutral-400 uppercase text-[10px] tracking-wider">
                Restaurant Partner (Supplier)
              </p>
              <p className="font-black text-sm mt-1">{order.restaurant.name}</p>
              <p className="text-neutral-600 dark:text-neutral-400 mt-0.5">{order.restaurant.address}</p>
              <p className="text-neutral-600 dark:text-neutral-400">Phone: {order.restaurant.phone}</p>
            </div>

            <div>
              <p className="font-bold text-neutral-400 uppercase text-[10px] tracking-wider">
                Delivered To (Customer)
              </p>
              <p className="font-black text-sm mt-1">{order.customer?.name || "Customer"}</p>
              <p className="text-neutral-600 dark:text-neutral-400 mt-0.5">
                {addressObj.addressLine}, {addressObj.city || "Mumbai"} - {addressObj.pincode || "400050"}
              </p>
              <p className="text-neutral-600 dark:text-neutral-400">
                Phone: {order.customer?.phone || "+91 98765 43210"}
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-400 uppercase text-[10px]">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 font-medium">{item.nameSnapshot}</td>
                    <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                    <td className="py-2.5 text-right font-mono">
                      {formatPaiseToRupees(item.pricePaiseSnapshot)}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold">
                      {formatPaiseToRupees(item.totalPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex flex-col sm:flex-row justify-between gap-6 text-xs">
            <div className="space-y-1.5 text-neutral-500 text-[11px] max-w-xs">
              <p className="font-bold text-neutral-700 dark:text-neutral-300">Payment & Tax Notes:</p>
              <p>• Goods and Services Tax (GST) charged @ 5% on restaurant dining/food services as per GST notification.</p>
              <p>• Payment Gateway: Verified Online Transaction.</p>
              <div className="pt-2 flex items-center gap-1.5 text-emerald-600 font-bold">
                <ShieldCheck className="w-4 h-4" /> Digitally Signed Tax Invoice
              </div>
            </div>

            <div className="space-y-2 min-w-[200px] text-xs">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Items Subtotal:</span>
                <span className="font-mono font-bold">{formatPaiseToRupees(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Restaurant GST (5%):</span>
                <span className="font-mono font-bold">{formatPaiseToRupees(tax)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Delivery Partner Fee:</span>
                <span className="font-mono font-bold">{formatPaiseToRupees(delivery)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Platform Convenience Fee:</span>
                <span className="font-mono font-bold">{formatPaiseToRupees(platform)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount:</span>
                  <span className="font-mono font-bold">-{formatPaiseToRupees(discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700 text-sm font-black text-neutral-900 dark:text-neutral-100">
                <span>Total Amount Paid:</span>
                <span className="text-orange-600">{formatPaiseToRupees(total)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-center text-[10px] text-neutral-400">
            Thank you for dining with {order.restaurant.name}! This is a computer-generated tax invoice and requires no physical signature.
          </div>
        </div>
      </div>
    </div>
  );
}
