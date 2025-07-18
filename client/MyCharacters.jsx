import React from "react";

const MyCharacters = ({ user, createdCharacters = [], onEditCharacter, onDeleteCharacter, onChatWithCharacter, onForceSync, isLoading }) => {
  // Combine built-in and created characters
  const allMyCharacters = [...user.characters, ...createdCharacters];
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">My Characters ({allMyCharacters.length})</h2>
        <button
          onClick={onForceSync}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Syncing...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Sync Characters</span>
            </>
          )}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allMyCharacters.length === 0 ? (
          <div className="col-span-full text-center py-8 bg-gray-900 rounded-lg">
            <p className="text-gray-400">You have not created any characters yet.</p>
          </div>
        ) : (
          allMyCharacters.map((character) => (
            <div key={character.id} className="bg-gray-900 rounded-xl p-4 shadow-lg flex flex-col justify-between">
              <div className="flex items-center mb-4">
                <img 
                  src={character.image || character.imageUrl || 'https://via.placeholder.com/128x160?text=No+Image'} 
                  alt={character.name} 
                  className="w-32 h-40 rounded-xl object-cover mr-4" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/128x160?text=Image+Error';
                  }}
                />
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
