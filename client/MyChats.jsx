import React from "react";

const MyChats = ({ user, chatSessions, onContinueChat, onDeleteChat }) => (
  <section>
    <h2 className="text-3xl font-bold mb-6">My Chats (Total: {chatSessions.length})</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {chatSessions.length === 0 ? (
        <div className="col-span-full text-center py-8 bg-gray-900 rounded-lg">
          <p className="text-gray-400">You have no chats yet.</p>
        </div>
      ) : (
        chatSessions.map(({ character, lastMessage, lastActive, messageCount }) => (
          <div key={character.id} className="bg-gray-900 rounded-xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center mb-4">
              <img src={character.image} alt={character.name} className="w-16 h-16 rounded-full object-cover mr-4" />
              <div>
                <h3 className="text-xl font-semibold mb-1">{character.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-2">{character.description}</p>
              </div>
            </div>
            <div className="mb-2 text-gray-300 text-sm">
              {lastMessage ? (
                <>
                  <span className="font-medium">Last:</span> {lastMessage}
                </>
              ) : (
                <span className="italic text-gray-500">No messages yet</span>
              )}
            </div>
            <div className="flex justify-between items-center mt-2">
              <button
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-medium transition-all"
                onClick={() => onContinueChat(character.id)}
              >
                Continue
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-white text-sm"
                onClick={() => onDeleteChat(character.id)}
              >
                Delete
              </button>
              <span className="text-xs text-gray-400 ml-2">{messageCount} messages</span>
            </div>
          </div>
        ))
      )}
    </div>
  </section>
);

export default MyChats;
