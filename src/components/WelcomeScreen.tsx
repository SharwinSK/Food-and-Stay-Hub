/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { MapPin, ArrowRight, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  // Beautiful Unsplash luxury dining table setting in hotel room environment
  const backgroundUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80";

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden welcome-overlay"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(12, 15, 23, 0.4) 0%, rgba(12, 15, 23, 0.95) 100%), url("${backgroundUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      id="welcome_container"
    >
      {/* Decorative Top Bar */}
      <div className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10" id="welcome_header">
        <div className="flex items-center space-x-2" id="logo_group">
          <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold font-display flex items-center justify-center shadow-lg shadow-amber-500/20" id="logo_icon">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold font-display text-white tracking-tight" id="logo_text">
            FOOD & STAY <span className="text-amber-400">HUB</span>
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs font-mono text-amber-400/90 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20 backdrop-blur-md" id="welcome_tag">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>MAPS GROUNDED AI</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center my-auto z-10" id="welcome_content">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
          id="content_motion_div"
        >
          <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-slate-300 tracking-widest uppercase mb-2 backdrop-blur-md" id="premium_sub">
            All-In-One Hospitality Discovery
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-display text-white tracking-tight leading-none" id="welcome_title">
            Welcome to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200">
              FOOD AND STAY HUB
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300/90 max-w-2xl mx-auto leading-relaxed font-sans" id="welcome_description">
            Discover exquisite restaurants and comfortable hotel accommodations tailored perfectly to your destination, 
            preferred country-style cuisines, and real-time location. Guided by intelligent Google Maps search grounding.
          </p>

          <div className="pt-6" id="welcome_actions">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNext}
              className="group inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-semibold px-8 py-4 rounded-xl shadow-xl shadow-amber-500/20 transition-all duration-300 cursor-pointer"
              id="get_started_btn"
            >
              <span className="text-base tracking-wide font-sans">Get Started</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Trust & Features Footer */}
      <div className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-white/5 z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left" id="welcome_footer">
        <div className="space-y-1" id="feat_1">
          <h4 className="text-sm font-semibold font-display text-white">Food Discovery</h4>
          <p className="text-xs text-slate-400">Filter fine dining and street food cafes by authentic regional styles.</p>
        </div>
        <div className="space-y-1" id="feat_2">
          <h4 className="text-sm font-semibold font-display text-white">Stay Explorations</h4>
          <p className="text-xs text-slate-400">Locate standard hotel stays, resorts, and homestays nearby.</p>
        </div>
        <div className="space-y-1" id="feat_3">
          <h4 className="text-sm font-semibold font-display text-white">Live Grounding</h4>
          <p className="text-xs text-slate-400">Real-time coordinates synced instantly to direct Google Maps directions.</p>
        </div>
      </div>
    </div>
  );
}
