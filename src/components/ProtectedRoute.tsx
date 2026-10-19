/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useAuth } from "../contexts/AuthContext";
import AuthPages from "./AuthPages";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
        <p className="text-sm font-medium text-stone-600 font-sans">Connecting to FOOD & STAY HUB...</p>
      </div>
    );
  }

  if (!userProfile) {
    return <AuthPages initialMode="login" />;
  }

  return <>{children}</>;
}
