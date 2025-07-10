import React from "react";

export default function SearchResults({ results, onSelectCharacter }) {
  if (!results || results.length === 0) {
    return <div className="text-center text-white/60 py-12">No characters found.</div>;
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">Search Results</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {results.map((character) => (
          <div
            key={character.id}
            className="bg-white/10 border border-white/20 rounded-3xl shadow-xl p-6 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => onSelectCharacter(character)}
          >
            <img src={character.image} alt={character.name} className="w-32 h-32 object-cover rounded-2xl mb-4" />
            <div className="font-bold text-lg text-white mb-2">{character.name}</div>
            <div className="text-white/70 text-sm mb-2 line-clamp-2">{character.description}</div>
            {character.nsfw && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">NSFW</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
