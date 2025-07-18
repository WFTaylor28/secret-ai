import React, { useState } from "react";

const CHARACTERS_PER_PAGE = 30;

const Home = ({ onStartChat, onCreateCharacter, publicCharacters = [], setActiveCharacter, openCharacterProfile }) => {
  const [page, setPage] = useState(1);
  // Toggle bar state
  const [showNSFW, setShowNSFW] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const [showHighlyRated, setShowHighlyRated] = useState(false);
  const [showNewlyCreated, setShowNewlyCreated] = useState(false);

  // Filtering and sorting logic
  let filtered = publicCharacters;
  if (!showNSFW) {
    filtered = filtered.filter(c => !c.nsfw);
  }
  if (showTrending) {
    filtered = [...filtered].sort((a, b) => (b.trending || 0) - (a.trending || 0));
  } else if (showHighlyRated) {
    filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (showNewlyCreated) {
    filtered = [...filtered].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  const totalPages = Math.ceil(filtered.length / CHARACTERS_PER_PAGE);
  const paginatedCharacters = filtered.slice(
    (page - 1) * CHARACTERS_PER_PAGE,
    page * CHARACTERS_PER_PAGE
  );

  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setPage((prev) => Math.min(prev + 1, totalPages));

  // Toggle bar UI
  return (
    <section className="mt-12 animate-fade-in">
      <h2 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
        Explore Public Characters 🚀
      </h2>
      {/* Toggle Bar */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
        <button
          className={`px-5 py-2 rounded-full font-semibold transition-all text-sm ${showNSFW ? 'bg-red-600 text-white' : 'bg-white/10 text-white/80 border border-white/20'} hover:bg-red-700`}
          onClick={() => setShowNSFW(v => !v)}
        >
          NSFW
        </button>
        <button
          className={`px-5 py-2 rounded-full font-semibold transition-all text-sm ${showTrending ? 'bg-pink-600 text-white' : 'bg-white/10 text-white/80 border border-white/20'} hover:bg-pink-700`}
          onClick={() => {
            setShowTrending(v => !v);
            setShowHighlyRated(false);
            setShowNewlyCreated(false);
          }}
        >
          Trending
        </button>
        <button
          className={`px-5 py-2 rounded-full font-semibold transition-all text-sm ${showHighlyRated ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/80 border border-white/20'} hover:bg-purple-700`}
          onClick={() => {
            setShowHighlyRated(v => !v);
            setShowTrending(false);
            setShowNewlyCreated(false);
          }}
        >
          Highly Rated
        </button>
        <button
          className={`px-5 py-2 rounded-full font-semibold transition-all text-sm ${showNewlyCreated ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80 border border-white/20'} hover:bg-blue-700`}
          onClick={() => {
            setShowNewlyCreated(v => !v);
            setShowTrending(false);
            setShowHighlyRated(false);
          }}
        >
          Newly Created
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {paginatedCharacters.map((character) => (
          <div
            key={character.id}
            className={`backdrop-blur-md bg-white/10 border border-white/20 shadow-xl transition-all duration-500 ease-in-out rounded-2xl overflow-hidden shadow-2xl hover:scale-105 hover:shadow-pink-500/30 group transition-transform duration-300 p-2 flex flex-col`}
            onClick={e => {
              if (e.target.tagName !== 'BUTTON' && openCharacterProfile) {
                openCharacterProfile(character);
              }
            }}
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ width: '100%', position: 'relative', height: '240px', overflow: 'hidden' }}>
              <img
                src={character.image || character.imageUrl || 'https://via.placeholder.com/200x240?text=No+Image'}
                alt={character.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                style={{ display: 'block', width: '100%', height: '100%' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/200x240?text=Image+Error';
                }}
              />
              {character.nsfw && (
                <div className="absolute top-2 right-2 bg-red-600 text-xs font-bold px-2 py-1 rounded-full">
                  NSFW
                </div>
              )}
            </div>
            <div className="pt-2 px-1 text-center flex flex-col justify-start">
              <h3 className="text-base font-bold mb-1 text-white/90 truncate">{character.name}</h3>
              <p className="text-gray-200 text-xs mb-2 line-clamp-2 min-h-[2.5em]">{character.description}</p>
              <button
                onClick={e => {
                  e.stopPropagation();
                  onStartChat();
                  setActiveCharacter(character);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-1 rounded-lg font-semibold transition-all text-xs"
              >
                Chat with {character.name}
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${page === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
          >
            Previous
          </button>
          <span className="text-white/80 font-medium">Page {page} of {totalPages}</span>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${page === totalPages ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default Home;
