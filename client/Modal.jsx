import React from "react";

function Modal({ onClose, title, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gradient-to-br from-[#2d1e4f] to-[#1a1333] rounded-2xl shadow-2xl border border-white/10 p-6 w-full max-w-lg mx-4 relative animate-fade-in">
        <button
          className="absolute top-3 right-3 text-white/60 hover:text-pink-400 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white/90">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default Modal;
