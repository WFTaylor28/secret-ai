import React from "react";

import { useNavigate } from "react-router-dom";

export default function SearchResults({ results, setActiveCharacter, openCharacterProfile }) {
  const navigate = useNavigate();
  if (!results || results.length === 0) {
    return <div className="text-center text-white/60 py-12">No characters found.</div>;
  }
  return (
    <section className="mt-12 animate-fade-in">
      <h2 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
        Search Results
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {results.map((character) => (
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
                src={character.image}
                alt={character.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                style={{ display: 'block', width: '100%', height: '100%' }}
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
                  if (setActiveCharacter) setActiveCharacter(character);
                  navigate(`/chat/${character.id}`);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-1 rounded-lg font-semibold transition-all text-xs"
              >
                Chat with {character.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
