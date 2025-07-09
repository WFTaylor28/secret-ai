import React from "react";

const Home = ({ onStartChat, onCreateCharacter, publicCharacters, setActiveCharacter, openCharacterProfile }) => (
  <section className="mt-12 animate-fade-in">
    <h2 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
      Explore Public Characters 🚀
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {publicCharacters.map((character) => (
        <div
          key={character.id}
          className={`backdrop-blur-md bg-white/10 border border-white/20 shadow-xl transition-all duration-500 ease-in-out rounded-3xl overflow-hidden shadow-2xl hover:scale-105 hover:shadow-pink-500/30 group transition-transform duration-300`}
          onClick={e => {
            // Only open profile if not clicking the chat button
            if (e.target.tagName !== 'BUTTON' && openCharacterProfile) {
              openCharacterProfile(character);
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="relative h-56 overflow-hidden">
            <img
              src={character.image}
              alt={character.name}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
            {character.nsfw && (
              <div className="absolute top-2 right-2 bg-red-600 text-xs font-bold px-2 py-1 rounded-full">
                NSFW
              </div>
            )}
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-2 text-white/90">
              {character.name}
            </h3>
            <p className="text-gray-200 text-base mb-4 line-clamp-2">
              {character.description}
            </p>
            <button
              onClick={e => {
                e.stopPropagation();
                onStartChat();
                setActiveCharacter(character);
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-2 rounded-xl font-semibold transition-all"
            >
              Chat with {character.name}
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Home;
