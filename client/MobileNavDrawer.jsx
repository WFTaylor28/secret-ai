
import React from "react";

const MobileNavDrawer = ({ open, onClose, children }) => {
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <nav
        className={`absolute top-0 left-0 h-full w-64 bg-gradient-to-br from-[#2d1e4f] to-[#1a1333] shadow-2xl border-r border-white/10 transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        role="navigation"
      >
        <button
          className="absolute top-4 right-4 text-white/80 hover:text-pink-400 focus:outline-none"
          onClick={onClose}
          aria-label="Close menu"
        >
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </button>
        <div className="mt-16 flex flex-col gap-2 px-6">
          {children}
        </div>
      </nav>
    </div>
  );
};

export default MobileNavDrawer;
