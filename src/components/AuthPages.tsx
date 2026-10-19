/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UtensilsCrossed, Building, Lock, Mail, User, AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface AuthPagesProps {
  initialMode?: "login" | "register";
  onSuccess?: () => void;
}

export default function AuthPages({ initialMode = "login", onSuccess }: AuthPagesProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, demoLogin } = useAuth();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "register") {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }

    try {
      setLoading(true);
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Auth error:", err);
      let msg = "Authentication failed. Please check your credentials.";
      if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'user' | 'business' | 'admin') => {
    setError(null);
    try {
      setLoading(true);
      await demoLogin(role);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError("Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] flex flex-col justify-center items-center px-4 py-12 selection:bg-amber-100 selection:text-amber-900">
      
      {/* Brand Header */}
      <div className="max-w-md w-full text-center space-y-3 mb-8">
        <div className="inline-flex items-center justify-center space-x-2.5 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold tracking-wide">
          <UtensilsCrossed className="h-3.5 w-3.5 text-amber-600" />
          <span>FOOD & STAY HUB</span>
          <Building className="h-3.5 w-3.5 text-amber-600 ml-1" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-[#1A1A1A]">
          {mode === "login" ? "Welcome Back" : "Create an Account"}
        </h1>
        <p className="text-sm text-stone-600">
          {mode === "login" 
            ? "Log in to order customized dishes or manage your restaurant & hotel." 
            : "Sign up to explore custom recipes, track orders, or register your hospitality business."}
        </p>
      </div>

      {/* Main Form Card */}
      <div className="max-w-md w-full bg-white rounded-3xl p-7 sm:p-9 shadow-xl shadow-stone-200/60 border border-stone-200/80 space-y-6">
        
        {/* Error Notification */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start space-x-2.5 animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Full Name</label>
              <div className="relative">
                <User className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Siti Aminah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">Email Address</label>
            <div className="relative">
              <Mail className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400"
              />
            </div>
          </div>

          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">Confirm Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
          >
            <span>{loading ? "Processing..." : mode === "login" ? "Log In" : "Create Account"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="pt-2 text-center text-xs text-stone-600">
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className="font-bold text-amber-600 hover:text-amber-700 hover:underline ml-1 cursor-pointer"
              >
                Sign up now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="font-bold text-amber-600 hover:text-amber-700 hover:underline ml-1 cursor-pointer"
              >
                Log in
              </button>
            </p>
          )}
        </div>

        {/* Instant 1-Click Demo Section */}
        <div className="border-t border-stone-100 pt-5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
            <span>Instant Demo Accounts</span>
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("user")}
              className="px-2 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 transition-all border border-stone-200"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("business")}
              className="px-2 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 transition-all border border-stone-200"
            >
              Restaurant Owner
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("admin")}
              className="px-2 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 transition-all border border-stone-200"
            >
              Admin
            </button>
          </div>
        </div>

      </div>

      <p className="mt-8 text-xs text-stone-600">
        FOOD & STAY HUB &bull; Personalized Hospitality, Custom Recipes & Authentic Discovery
      </p>

    </div>
  );
}
