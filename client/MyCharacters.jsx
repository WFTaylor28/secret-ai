import React from "react";

const MyCharacters = ({ user, createdCharacters = [], onEditCharacter, onDeleteCharacter, onChatWithCharacter }) => {
  // Combine built-in and created characters
  const allMyCharacters = [...user.characters, ...createdCharacters];
  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">My Characters ({allMyCharacters.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allMyCharacters.length === 0 ? (
          <div className="col-span-full text-center py-8 bg-gray-900 rounded-lg">
            <p className="text-gray-400">You have not created any characters yet.</p>
          </div>
        ) : (
          allMyCharacters.map((character) => (
            <div key={character.id} className="bg-gray-900 rounded-xl p-4 shadow-lg flex flex-col justify-between">
              <div className="flex items-center mb-4">
                <img src={character.image} alt={character.name} className="w-32 h-40 rounded-xl object-cover mr-4" />
                <div>
                  <h3 className="text-xl font-semibold mb-1">{character.name}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{character.description}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center mt-2">
                {onEditCharacter && (
                  <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-medium transition-all"
                    onClick={() => onEditCharacter(character)}
                  >
                    Edit
                  </button>
                )}
                {onDeleteCharacter && (
                  <button
                    className="bg-red-700 hover:bg-red-800 px-3 py-2 rounded text-white text-sm"
                    onClick={() => onDeleteCharacter(character)}
                    title="Delete Character"
                  >
                    Delete
                  </button>
                )}
                {onChatWithCharacter && (
                  <button
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-medium transition-all"
                    onClick={() => onChatWithCharacter(character.id)}
                    title="Chat with Character"
                  >
                    Chat
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default MyCharacters;
