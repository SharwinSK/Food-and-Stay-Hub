/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  MapPin, 
  Utensils, 
  Hotel, 
  Shield, 
  Search, 
  RefreshCw, 
  ArrowLeft, 
  LogOut, 
  Calendar, 
  Mail, 
  Layers, 
  Activity 
} from "lucide-react";
import { UserProfile } from "../types";

interface AdminDashboardProps {
  token: string;
  currentUser: UserProfile;
  onBack: () => void;
  onLogout: () => void;
  backLabel?: string;
}

export default function AdminDashboard({ token, currentUser, onBack, onLogout, backLabel }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to load admin user data");
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
      setError("Server connection failure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Filters and searches users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.location?.city || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = 
      filterRole === "all" || 
      (filterRole === "admin" && u.role === "admin") ||
      (filterRole === "user" && u.role !== "admin");

    return matchesSearch && matchesRole;
  });

  // Basic analytics calculations
  const totalUsersCount = users.length;
  const adminUsersCount = users.filter((u) => u.role === "admin").length;
  const standardUsersCount = totalUsersCount - adminUsersCount;

  // Cuisine Popularity Metrics
  const cuisineCounts: Record<string, number> = {};
  users.forEach((u) => {
    if (u.preferredCuisine) {
      cuisineCounts[u.preferredCuisine] = (cuisineCounts[u.preferredCuisine] || 0) + 1;
    }
  });
  const topCuisine = Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None yet";

  // Location Distribution Metrics
  const locationCounts: Record<string, number> = {};
  users.forEach((u) => {
    if (u.location?.city) {
      locationCounts[u.location.city] = (locationCounts[u.location.city] || 0) + 1;
    }
  });
  const topLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None yet";

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-500/30 selection:text-white" id="admin_root">
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 px-6 py-4" id="admin_header">
        <div className="max-w-7xl mx-auto flex items-center justify-between" id="admin_header_inner">
          <div className="flex items-center space-x-3" id="admin_logo_group">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold flex items-center justify-center shadow-lg shadow-amber-500/10" id="admin_logo_badge">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold font-display tracking-tight flex items-center space-x-2">
              <span>FOOD & STAY</span> 
              <span className="text-amber-400 bg-amber-500/10 text-xs px-2 py-0.5 rounded-full font-mono font-bold tracking-widest uppercase">Admin Panel</span>
            </span>
          </div>

          <div className="flex items-center space-x-3" id="admin_header_actions">
            <button 
              onClick={onBack}
              className="text-xs bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3.5 py-1.5 rounded-xl font-semibold transition-all duration-200 cursor-pointer flex items-center space-x-1"
              id="admin_back_btn"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{backLabel || "Back"}</span>
            </button>
            <button 
              onClick={onLogout}
              className="text-xs bg-slate-900 hover:bg-red-500/10 hover:text-red-400 border border-slate-800 hover:border-red-500/20 px-3.5 py-1.5 rounded-xl font-medium transition-all duration-200 cursor-pointer flex items-center space-x-1"
              id="admin_logout_btn"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8" id="admin_main">
        {/* Verification Check Banner */}
        {currentUser.role !== "admin" ? (
          <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center space-y-4" id="admin_unauthorized_banner">
            <Shield className="h-12 w-12 text-red-400 mx-auto animate-bounce" />
            <h2 className="text-xl font-bold">Access Denied</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              This panel is restricted exclusively to authenticated administrators. If you possess administrative credentials, please sign in.
            </p>
            <button onClick={onBack} className="bg-slate-900 border border-slate-800 px-6 py-2.5 rounded-xl text-xs font-semibold cursor-pointer">
              Go Back
            </button>
          </div>
        ) : (
          <>
            {/* Overview Stats Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="admin_stats_grid">
              
              {/* Stat 1: Total Users */}
              <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl flex items-center space-x-4" id="stat_total_users">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                  <Users className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Total Users</span>
                  <span className="text-2xl font-bold font-mono text-white">{totalUsersCount}</span>
                </div>
              </div>

              {/* Stat 2: Regular / Admins */}
              <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl flex items-center space-x-4" id="stat_admins">
                <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Admins / Standard</span>
                  <span className="text-2xl font-bold font-mono text-white">
                    {adminUsersCount} <span className="text-xs text-slate-500 font-normal">/ {standardUsersCount}</span>
                  </span>
                </div>
              </div>

              {/* Stat 3: Top Cuisine Style */}
              <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl flex items-center space-x-4" id="stat_cuisine">
                <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl">
                  <Utensils className="h-6 w-6" />
                </div>
                <div className="space-y-1 overflow-hidden">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Top Cuisine</span>
                  <span className="text-lg font-bold truncate text-white block">{topCuisine}</span>
                </div>
              </div>

              {/* Stat 4: Top Location */}
              <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl flex items-center space-x-4" id="stat_location">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="space-y-1 overflow-hidden">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Top Location</span>
                  <span className="text-lg font-bold truncate text-white block">{topLocation}</span>
                </div>
              </div>

            </div>

            {/* Users Data Table and Search Controls */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-6" id="admin_table_card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="table_actions">
                <div>
                  <h3 className="text-lg font-bold flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-amber-400" />
                    <span>Registered Application Users</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Secure, real-time look into your application database.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3" id="table_search_filters">
                  {/* Search Bar */}
                  <div className="relative" id="search_bar_wrapper">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Search by name, email or city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 w-60"
                      id="admin_user_search"
                    />
                  </div>

                  {/* Filter Role */}
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value as any)}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    id="admin_role_filter"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Administrators Only</option>
                    <option value="user">Standard Users Only</option>
                  </select>

                  {/* Refresh Button */}
                  <button 
                    onClick={fetchUsers}
                    disabled={loading}
                    className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 hover:text-white rounded-xl transition duration-200 cursor-pointer disabled:opacity-50"
                    title="Refresh data"
                    id="admin_refresh_btn"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Loader */}
              {loading ? (
                <div className="py-20 text-center space-y-3" id="admin_table_loader">
                  <RefreshCw className="h-8 w-8 text-amber-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Retrieving system records...</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center" id="admin_table_error">
                  {error}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-xs space-y-1" id="admin_table_empty">
                  <Users className="h-10 w-10 text-slate-700 mx-auto mb-2" />
                  <p className="font-semibold text-slate-400">No users found</p>
                  <p className="text-slate-500">Refine your query parameters or search term.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-900" id="admin_table_container">
                  <table className="w-full text-left border-collapse" id="admin_users_table">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-900 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Account Created</th>
                        <th className="px-6 py-4">Active Location</th>
                        <th className="px-6 py-4">Cuisine Preference</th>
                        <th className="px-6 py-4">Seek Target</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-xs">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition duration-150" id={`user_row_${u.id}`}>
                          {/* User Metadata */}
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-amber-400 uppercase">
                                {u.name.substring(0, 2)}
                              </div>
                              <div className="space-y-0.5">
                                <div className="font-semibold text-white flex items-center space-x-1.5">
                                  <span>{u.name}</span>
                                  {u.id === currentUser.id && (
                                    <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full font-mono font-medium">You</span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center space-x-1 font-mono">
                                  <Mail className="h-3 w-3" />
                                  <span>{u.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="px-6 py-4">
                            {u.role === "admin" ? (
                              <span className="inline-flex items-center space-x-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                                <Shield className="h-3 w-3" />
                                <span>Admin</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                <Users className="h-3 w-3" />
                                <span>Standard</span>
                              </span>
                            )}
                          </td>

                          {/* Created At */}
                          <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3.5 w-3.5 text-slate-500" />
                              <span>{new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                          </td>

                          {/* Location Setup */}
                          <td className="px-6 py-4">
                            {u.location ? (
                              <div className="space-y-0.5">
                                <div className="text-white font-medium flex items-center space-x-1">
                                  <MapPin className="h-3 w-3 text-red-400" />
                                  <span>{u.location.city || "Detected Near Nilai"}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {u.location.type === "gps" ? "Active GPS" : `${u.location.area || "Nilai"}`}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-600 italic">No Location Saved</span>
                            )}
                          </td>

                          {/* Cuisine Preference */}
                          <td className="px-6 py-4">
                            {u.preferredCuisine ? (
                              <span className="inline-flex items-center space-x-1 bg-pink-500/5 border border-pink-500/10 text-pink-300 px-2 py-0.5 rounded-lg text-[11px] font-medium">
                                <Utensils className="h-3 w-3" />
                                <span>{u.preferredCuisine}</span>
                              </span>
                            ) : (
                              <span className="text-slate-600 italic">Not set</span>
                            )}
                          </td>

                          {/* Search Preference */}
                          <td className="px-6 py-4">
                            {u.searchPreference ? (
                              u.searchPreference === "hotels" ? (
                                <span className="inline-flex items-center space-x-1 bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded-lg text-[11px] font-medium border border-teal-500/10">
                                  <Hotel className="h-3 w-3 text-teal-400" />
                                  <span>Hotels</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg text-[11px] font-medium border border-amber-500/10">
                                  <Utensils className="h-3 w-3 text-amber-400" />
                                  <span>Restaurants</span>
                                </span>
                              )
                            ) : (
                              <span className="text-slate-600 italic">Not set</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
