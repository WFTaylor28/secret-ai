import React from "react";

const Chat = ({
  user,
  activeCharacter,
  setActiveCharacter,
  messages,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isTyping,
  pendingAI,
}) => (
  <section>
    <h2 className="text-3xl font-bold mb-6">Your Chats</h2>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Character List */}
      <div className="lg:col-span-1">
        <h3 className="text-xl font-semibold mb-4">Characters</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {user.characters.map((character) => (
            <div
              key={character.id}
              onClick={() => setActiveCharacter(character)}
              className={`bg-gray-900 p-3 rounded-lg flex items-center space-x-3 cursor-pointer transition-colors ${
                activeCharacter?.id === character.id ? "ring-2 ring-purple-500" : "hover:bg-gray-800"
              }`}
            >
              <img
                src={character.image}
                alt={character.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-medium">{character.name}</h4>
                <p className="text-xs text-gray-400 truncate">{character.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Chat Interface */}
      <div className="lg:col-span-2 bg-gray-900 rounded-xl p-4 min-h-[400px] flex flex-col">
        {!activeCharacter ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a character to start chatting.
          </div>
        ) : (
          <>
            <div className="flex items-center p-2 border-b border-gray-700 mb-2">
              <img
                src={activeCharacter.image}
                alt={activeCharacter.name}
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <h4 className="font-semibold">{activeCharacter.name}</h4>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"} items-start`}
                >
                  {!msg.isUser && (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mr-2">
                      A
                    </div>
                  )}
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg ${
                      msg.isUser ? "bg-purple-600 ml-auto" : "bg-gray-800 mr-auto"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  {msg.isUser && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 ml-2">
                      U
                    </div>
                  )}
                </div>
              ))}
              {/* AI is typing bubble ("..."), only if not animating reply */}
              {isTyping && pendingAI && pendingAI.thinking && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                    A
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg max-w-md flex items-center">
                    <span className="dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </span>
                  </div>
                </div>
              )}
              {/* AI typewriter bubble */}
              {pendingAI && !pendingAI.thinking && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                    A
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg max-w-md flex items-center">
                    <span className="typewriter">{pendingAI.text}</span>
                  </div>
                </div>
              )}
            </div>
            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={!activeCharacter}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || !activeCharacter}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  inputMessage.trim() && activeCharacter
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-gray-800 cursor-not-allowed"
                }`}
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  </section>
);

export default Chat;
