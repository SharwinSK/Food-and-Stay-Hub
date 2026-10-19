/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Banknote, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Receipt, 
  AlertCircle, 
  Loader2, 
  QrCode, 
  Wallet
} from "lucide-react";
import BackButton from "./BackButton";
import { SelectedDeliveryOption } from "./DeliveryServiceSelector";
import { PaymentMethod, PaymentStatus } from "../types";

// ============================================================================
// PLACEHOLDER / TEST DATA: Bank account details and QR code are sample data 
// for testing and demonstration purposes only. These will be replaced with
// real merchant payment gateway or bank details in production.
// ============================================================================
const PLACEHOLDER_BANK_DETAILS = {
  bankName: "Maybank",
  accountNumber: "1234 5678 9012",
  accountHolderName: "FOOD & STAY HUB SDN BHD",
  duitNowId: "123456789012"
};

interface PaymentMethodSelectorProps {
  subtotal: number;
  deliveryOption: SelectedDeliveryOption;
  onBackToService: () => void;
  onProceedToOrder: (method: PaymentMethod, status: PaymentStatus) => void;
  isSubmitting: boolean;
}

export default function PaymentMethodSelector({
  subtotal,
  deliveryOption,
  onBackToService,
  onProceedToOrder,
  isSubmitting
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash");
  const [copiedAccount, setCopiedAccount] = useState(false);

  const grandTotal = Math.round((subtotal + deliveryOption.fee) * 100) / 100;

  const handleCopyAccountNumber = () => {
    navigator.clipboard?.writeText(PLACEHOLDER_BANK_DETAILS.accountNumber.replace(/\s+/g, ''));
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCashCheckout = () => {
    onProceedToOrder("cash", "pending");
  };

  const handleBankTransferCheckout = () => {
    onProceedToOrder("bank_transfer", "pending_verification");
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Step Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            Checkout Step 3 of 3
          </span>
          <h3 className="text-base font-bold font-serif text-stone-900">
            Select Payment Method
          </h3>
        </div>
        <BackButton
          onClick={onBackToService}
          label="Back to Delivery"
          id="payment_back_to_service_btn"
        />
      </div>

      {/* Bill Summary Banner */}
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
        <div className="flex items-center justify-between text-stone-700 font-bold border-b border-stone-200/80 pb-2">
          <div className="flex items-center space-x-1.5">
            <Receipt className="h-4 w-4 text-amber-600" />
            <span>Order Total to Pay</span>
          </div>
          <span className="text-base font-black text-amber-800">
            RM {grandTotal.toFixed(2)}
          </span>
        </div>

        <div className="space-y-1 text-[11px] text-stone-600">
          <div className="flex items-center justify-between">
            <span>Dishes Subtotal:</span>
            <span className="font-semibold text-stone-800">RM {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Delivery Fee ({deliveryOption.service} &bull; {deliveryOption.distanceKm} km):</span>
            <span className="font-semibold text-amber-700">+ RM {deliveryOption.fee.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Selectable Payment Cards (Consistent Radio-Style Cards) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
          Choose How to Pay:
        </label>

        {/* 1. Cash Card */}
        <div
          onClick={() => setSelectedMethod("cash")}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between ${
            selectedMethod === "cash"
              ? "border-amber-500 bg-amber-50/50 shadow-sm shadow-amber-500/10"
              : "border-stone-200 bg-white hover:border-stone-300"
          }`}
        >
          <div className="flex items-start space-x-3.5">
            <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
              selectedMethod === "cash"
                ? "border-amber-600 bg-amber-500 text-white"
                : "border-stone-300 bg-white"
            }`}>
              {selectedMethod === "cash" && (
                <div className="w-2 h-2 rounded-full bg-slate-950" />
              )}
            </div>

            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 shrink-0">
              <Banknote className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-stone-900">Cash</h4>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  On Handover
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Pay with cash upon delivery or pickup directly to rider.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-bold text-amber-800 bg-white px-2 py-1 rounded-lg border border-amber-200 shadow-2xs">
              COD
            </span>
          </div>
        </div>

        {/* 2. Bank Transfer Card */}
        <div
          onClick={() => setSelectedMethod("bank_transfer")}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between ${
            selectedMethod === "bank_transfer"
              ? "border-amber-500 bg-amber-50/50 shadow-sm shadow-amber-500/10"
              : "border-stone-200 bg-white hover:border-stone-300"
          }`}
        >
          <div className="flex items-start space-x-3.5">
            <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
              selectedMethod === "bank_transfer"
                ? "border-amber-600 bg-amber-500 text-white"
                : "border-stone-300 bg-white"
            }`}>
              {selectedMethod === "bank_transfer" && (
                <div className="w-2 h-2 rounded-full bg-slate-950" />
              )}
            </div>

            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 shrink-0">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-stone-900">Bank Transfer</h4>
                <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                  Instant / QR
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Online banking transfer or scan DuitNow QR with verification.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-bold text-blue-800 bg-white px-2 py-1 rounded-lg border border-blue-200 shadow-2xs">
              Maybank
            </span>
          </div>
        </div>
      </div>

      {/* ===================== CASH SELECTED VIEW ===================== */}
      {selectedMethod === "cash" && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3 animate-fadeIn">
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-950">
                Pay with cash on delivery/pickup.
              </p>
              <p className="text-[11px] text-amber-800/80 leading-relaxed">
                Please prepare exact change of <strong className="font-bold text-amber-950">RM {grandTotal.toFixed(2)}</strong> if possible for a quick and smooth handover with your dispatch rider.
              </p>
            </div>
          </div>

          {/* Cash Confirmation Button */}
          <button
            type="button"
            onClick={handleCashCheckout}
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
            id="proceed_to_order_cash_btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Placing Your Order...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Proceed to Order (RM {grandTotal.toFixed(2)})</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* ===================== BANK TRANSFER SELECTED VIEW ===================== */}
      {selectedMethod === "bank_transfer" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 space-y-4 animate-fadeIn shadow-xs">
          
          {/* Header & Sandbox Notice */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-amber-600" />
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Bank Transfer Details
              </h4>
            </div>
            {/* Clearly labeled as a sample for testing */}
            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
              (Sample for testing)
            </span>
          </div>

          {/* Account Details Box */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/90 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-medium">Bank Name:</span>
              <span className="font-bold text-stone-900 bg-white px-2.5 py-0.5 rounded border border-stone-200">
                {PLACEHOLDER_BANK_DETAILS.bankName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-medium">Account Number:</span>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-bold text-amber-900 tracking-wider">
                  {PLACEHOLDER_BANK_DETAILS.accountNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAccountNumber}
                  className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
                  title="Copy account number"
                >
                  {copiedAccount ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-medium">Account Holder:</span>
              <span className="font-semibold text-stone-800 text-[11px] text-right">
                {PLACEHOLDER_BANK_DETAILS.accountHolderName}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
              <span className="text-[11px] text-stone-500 font-medium">Transfer Amount:</span>
              <span className="font-black text-amber-800 text-sm font-mono">
                RM {grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* QR Code Section (Clearly labeled sample/placeholder) */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 text-center space-y-2.5">
            <div className="flex items-center justify-center space-x-1.5 text-[11px] font-bold text-amber-900">
              <QrCode className="h-3.5 w-3.5" />
              <span>DuitNow / Bank QR Code</span>
              <span className="text-[10px] text-stone-500 font-normal">(Sample for testing)</span>
            </div>

            {/* High-res Clean SVG Placeholder QR Code */}
            <div className="inline-block p-3 bg-white rounded-2xl shadow-sm border border-stone-200">
              <svg 
                className="w-36 h-36 mx-auto" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background */}
                <rect width="100" height="100" fill="white" />
                {/* Top-Left Finder Pattern */}
                <rect x="10" y="10" width="24" height="24" rx="2" fill="#1C1917" />
                <rect x="14" y="14" width="16" height="16" rx="1" fill="white" />
                <rect x="18" y="18" width="8" height="8" rx="1" fill="#D97706" />
                {/* Top-Right Finder Pattern */}
                <rect x="66" y="10" width="24" height="24" rx="2" fill="#1C1917" />
                <rect x="70" y="14" width="16" height="16" rx="1" fill="white" />
                <rect x="74" y="18" width="8" height="8" rx="1" fill="#D97706" />
                {/* Bottom-Left Finder Pattern */}
                <rect x="10" y="66" width="24" height="24" rx="2" fill="#1C1917" />
                <rect x="14" y="70" width="16" height="16" rx="1" fill="white" />
                <rect x="18" y="74" width="8" height="8" rx="1" fill="#D97706" />
                {/* QR Data Matrix Dots */}
                <rect x="38" y="12" width="4" height="8" fill="#1C1917" />
                <rect x="46" y="16" width="6" height="4" fill="#1C1917" />
                <rect x="56" y="12" width="4" height="6" fill="#1C1917" />
                <rect x="12" y="38" width="8" height="4" fill="#1C1917" />
                <rect x="24" y="44" width="4" height="6" fill="#1C1917" />
                <rect x="16" y="52" width="6" height="6" fill="#1C1917" />
                <rect x="38" y="38" width="24" height="24" rx="4" fill="#F59E0B" fillOpacity="0.15" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3 3" />
                {/* Center Badge */}
                <text x="50" y="48" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#92400E" fontFamily="sans-serif">TEST QR</text>
                <text x="50" y="56" fontSize="5" textAnchor="middle" fill="#78350F" fontFamily="sans-serif">RM {grandTotal.toFixed(2)}</text>
                {/* Timing & Data Patterns */}
                <rect x="38" y="68" width="6" height="4" fill="#1C1917" />
                <rect x="48" y="74" width="4" height="8" fill="#1C1917" />
                <rect x="56" y="66" width="8" height="4" fill="#1C1917" />
                <rect x="68" y="38" width="6" height="6" fill="#1C1917" />
                <rect x="78" y="48" width="6" height="4" fill="#1C1917" />
                <rect x="68" y="56" width="4" height="6" fill="#1C1917" />
                <rect x="76" y="66" width="8" height="8" fill="#1C1917" />
                <rect x="68" y="78" width="6" height="6" fill="#1C1917" />
                <rect x="86" y="78" width="4" height="6" fill="#1C1917" />
              </svg>
            </div>

            <p className="text-[10px] text-amber-800">
              Scan with your Maybank, CIMB, Touch 'n Go eWallet, or any DuitNow QR app.
            </p>
          </div>

          {/* Share Receipt Section & Button */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <div className="flex items-start space-x-2 text-[11px] text-stone-600">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Once you have completed the transfer, click <strong className="text-stone-900">Share Receipt</strong> to send your order to the kitchen. The restaurant will verify your receipt during order preparation.
              </span>
            </div>

            <button
              type="button"
              onClick={handleBankTransferCheckout}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
              id="share_receipt_btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Transfer & Placing Order...</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  <span>Share Receipt & Confirm Order (RM {grandTotal.toFixed(2)})</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
