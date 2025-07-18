import React from "react";

const MyChats = ({ user, chatSessions, allCharacters = [], onContinueChat, onDeleteChat, onShowChatMemory, openCharacterProfile }) => {
  // Combine session data with character data
  const sessionsWithCharacters = chatSessions.map(session => {
    const character = allCharacters.find(c => c.id === session.characterId);
    if (!character) return null;
    
    // Get last message if any
    const lastMessage = session.messages && session.messages.length > 0 
      ? session.messages[session.messages.length - 1].text
      : '';
      
    return {
      session,
      character,
      lastMessage,
      messageCount: session.messages ? session.messages.length : 0
    };
  }).filter(Boolean); // Remove null entries
  
  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">My Chats (Total: {sessionsWithCharacters.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessionsWithCharacters.length === 0 ? (
          <div className="col-span-full text-center py-8 bg-gray-900 rounded-lg">
            <p className="text-gray-400">You have no chats yet.</p>
          </div>
        ) : (
          sessionsWithCharacters.map(({ character, lastMessage, session, messageCount }) => (
            <div key={character.id} className="bg-gradient-to-br from-[#2d1e4f] to-[#1a1333] rounded-xl shadow-lg p-4 flex flex-col md:flex-row items-center md:items-start gap-4">
              <img
                src={character.image || character.imageUrl || 'https://via.placeholder.com/128x128?text=No+Image'}
                alt={character.name}
                className="w-20 h-28 object-cover rounded-xl border border-white/10 shadow"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/128x128?text=Image+Error';
                }}
              />
              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
                  <div>
                    <h3 className="text-lg font-bold mb-1">{character.name}</h3>
                    <p className="text-white/80 text-sm mb-2">{lastMessage || character.description}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {character.tags && character.tags.map(tag => (
                        <span key={tag} className="bg-pink-700/80 text-white text-xs px-2 py-1 rounded-full font-semibold shadow">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 md:mt-0 w-full md:w-auto">
                    <button
                      className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow"
                      onClick={() => onContinueChat(character.id)}
                    >
                      Continue
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold shadow"
                      onClick={() => openCharacterProfile(character)}
                    >
                      Profile
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-800 text-white text-xs font-semibold shadow"
                      onClick={() => onShowChatMemory(character.id)}
                    >
                      Memory
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-red-700 hover:bg-red-800 text-white text-xs font-semibold shadow"
                      onClick={() => onDeleteChat(character.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/60 mt-2">
                  <span>Messages: {messageCount}</span>
                  <span>Last Active: {session.lastActive ? new Date(session.lastActive).toLocaleString() : 'Never'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default MyChats;
