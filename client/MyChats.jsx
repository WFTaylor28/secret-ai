import React from "react";

const MyChats = ({ user, chatSessions, onContinueChat, onDeleteChat, onShowChatMemory, openCharacterProfile }) => (
  <section>
    <h2 className="text-3xl font-bold mb-6">My Chats (Total: {chatSessions.length})</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {chatSessions.length === 0 ? (
        <div className="col-span-full text-center py-8 bg-gray-900 rounded-lg">
          <p className="text-gray-400">You have no chats yet.</p>
        </div>
      ) : (
          chatSessions.map(({ character, lastMessage, lastActive, messageCount }) => (
            <div key={character.id} className="bg-gradient-to-br from-[#2d1e4f] to-[#1a1333] rounded-xl shadow-lg p-4 flex flex-col md:flex-row items-center md:items-start gap-4">
              <img
                src={character.image}
                alt={character.name}
                className="w-20 h-28 object-cover rounded-xl border border-white/10 shadow"
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
                  <span>Last Active: {lastActive ? new Date(lastActive).toLocaleString() : 'Never'}</span>
                </div>
              </div>
            </div>
          ))
      )}
    </div>
  </section>
);

export default MyChats;
