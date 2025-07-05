import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">AI Roleplay Hub</h1>

        <nav className="hidden md:flex space-x-6">
          <a href="/" className="hover:text-primary transition">Home</a>
          <a href="/create" className="hover:text-primary transition">Create</a>
          <a href="/chat" className="hover:text-primary transition">Chat</a>
          <a href="/gallery" className="hover:text-primary transition">Gallery</a>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 p-4">
          <a href="/" className="block py-2 hover:text-primary">Home</a>
          <a href="/create" className="block py-2 hover:text-primary">Create</a>
          <a href="/chat" className="block py-2 hover:text-primary">Chat</a>
          <a href="/gallery" className="block py-2 hover:text-primary">Gallery</a>
        </div>
      )}
    </header>
  );
};

export default Header;
