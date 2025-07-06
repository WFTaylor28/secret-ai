import React, { useState } from "react";

// Glassmorphism and animation helpers
const glass = "backdrop-blur-md bg-white/10 border border-white/20 shadow-xl";
const fadeIn = "transition-all duration-500 ease-in-out";

const App = () => {
  // Mock user data
  const [user] = useState({
    id: 1,
    username: "User123",
    characters: [
      {
        id: 1,
        name: "Mystique AI",
        image: "https://picsum.photos/seed/mystique/200/200 ",
        description: "A mysterious AI with deep knowledge of the arcane.",
        isPublic: true,
        nsfw: false,
      },
      {
        id: 2,
        name: "Luna",
        image: "https://picsum.photos/seed/luna/200/200 ",
        description: "A gentle AI companion who loves stargazing.",
        isPublic: false,
        nsfw: false,
      },
      {
        id: 3,
        name: "Vortex",
        image: "https://picsum.photos/seed/vortex/200/200 ",
        description: "A high-energy AI that thrives on chaos and creativity.",
        isPublic: true,
        nsfw: true,
      },
    ],
  });

  // Navigation state
  const [activeTab, setActiveTab] = useState("home");

  // Character creation form state
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    image: null,
    description: "",
    isPublic: false,
    nsfw: false,
  });

  // Chat-related states
  const [activeCharacter, setActiveCharacter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");

  // Handle input changes in character form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCharacter((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle file upload
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewCharacter((prev) => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Submit new character
  const handleSubmit = (e) => {
    e.preventDefault();
    const createdCharacter = {
      ...newCharacter,
      id: Date.now(),
    };
    console.log("Creating character:", createdCharacter);
    alert(`Character "${createdCharacter.name}" created successfully!`);
    setNewCharacter({
      name: "",
      image: null,
      description: "",
      isPublic: false,
      nsfw: false,
    });
  };

  // Simulated chat message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeCharacter) return;

    const userMessage = { text: inputMessage, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    setError("");

    try {
      // Call backend API instead of mock
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text, character: activeCharacter }),
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { text: data.reply, isUser: false },
      ]);
    } catch (err) {
      setError("Failed to get a response from AI. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  // Filtered characters based on tab
  const publicCharacters = user.characters.filter((c) => c.isPublic);
  const privateCharacters = user.characters.filter((c) => !c.isPublic);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1333] via-[#2d1e4f] to-[#0f051d] text-white flex flex-col">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700/40 via-pink-500/10 to-indigo-900/60 pointer-events-none" />
        <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex-1">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg mb-4 animate-fade-in">
              SecretAI
            </h1>
            <p className="text-lg md:text-2xl text-white/80 mb-6 max-w-xl animate-fade-in delay-100">
              Create, chat, and explore with custom AI characters in a beautiful, immersive interface.
            </p>
            <div className="flex gap-4 animate-fade-in delay-200">
              <button
                onClick={() => setActiveTab("chat")}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-semibold shadow-lg transition-all transform hover:scale-105"
              >
                Start Chatting
              </button>
              <button
                onClick={() => setActiveTab("my-characters")}
                className="px-6 py-3 rounded-full border border-purple-400 text-purple-200 hover:bg-purple-800/30 font-semibold shadow-lg transition-all"
              >
                Create Character
              </button>
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center animate-fade-in delay-300">
            <div className="w-72 h-72 rounded-full bg-gradient-to-tr from-purple-500 via-pink-400 to-indigo-500 opacity-60 blur-2xl absolute z-0" />
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=400&q=80"
              alt="AI Art"
              className="relative z-10 w-60 h-60 object-cover rounded-3xl shadow-2xl border-4 border-white/10"
            />
          </div>
        </div>
        <nav className="container mx-auto px-4 pb-4 flex justify-center md:justify-end gap-8">
          {[
            { tab: "home", label: "Home" },
            { tab: "my-characters", label: "My Characters" },
            { tab: "chat", label: "Chat" },
          ].map(({ tab, label }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-lg font-medium px-4 py-2 rounded-full transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "text-purple-200 hover:bg-purple-800/30"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1 w-full">
        {/* Test Button - For Style Verification */}
        <button style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          Test Button
        </button>

        {/* Home Tab */}
        {activeTab === "home" && (
          <section className="mt-12 animate-fade-in">
            <h2 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
              Explore Public Characters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {publicCharacters.map((character) => (
                <div
                  key={character.id}
                  className={`${glass} ${fadeIn} rounded-3xl overflow-hidden shadow-2xl hover:scale-105 hover:shadow-pink-500/30 group transition-transform duration-300`}
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
                      onClick={() => {
                        setActiveTab("chat");
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
        )}

        {/* My Characters Tab */}
        {activeTab === "my-characters" && (
          <section>
            <h2 className="text-3xl font-bold mb-6">My Characters</h2>

            {/* Public Characters Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Public Characters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicCharacters.length > 0 ? (
                  publicCharacters.map((character) => (
                    <div
                      key={character.id}
                      className={`${glass} ${fadeIn} rounded-3xl overflow-hidden shadow-2xl hover:scale-105 hover:shadow-pink-500/30 group transition-transform duration-300`}
                    >
                      <div className="relative h-48 overflow-hidden">
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
                        <div className="flex justify-between">
                          <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
                            Edit
                          </button>
                          <button className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">
                      You don't have any public characters yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Private Characters Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Private Characters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {privateCharacters.length > 0 ? (
                  privateCharacters.map((character) => (
                    <div
                      key={character.id}
                      className={`${glass} ${fadeIn} rounded-3xl overflow-hidden shadow-2xl hover:scale-105 hover:shadow-pink-500/30 group transition-transform duration-300`}
                    >
                      <div className="relative h-48 overflow-hidden">
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
                        <div className="flex justify-between">
                          <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
                            Edit
                          </button>
                          <button className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">
                      You don't have any private characters yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Character Creation Form */}
            <div className="mt-12 p-6 bg-gray-800 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Create New Character</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Character Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newCharacter.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter character name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Character Image
                  </label>
                  <div className="flex items-center space-x-4">
                    {newCharacter.image ? (
                      <img
                        src={newCharacter.image}
                        alt="Preview"
                        className="w-20 h-20 rounded object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs text-center">
                          No image
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Backstory / Description
                  </label>
                  <textarea
                    name="description"
                    value={newCharacter.description}
                    onChange={handleInputChange}
                    rows={3}
                    required
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe your character..."
                  ></textarea>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={newCharacter.isPublic}
                      onChange={handleInputChange}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Make Public</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="nsfw"
                      checked={newCharacter.nsfw}
                      onChange={handleInputChange}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>NSFW Content</span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
                  >
                    Create Character
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && (
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
                      className={`bg-gray-800 p-3 rounded-lg flex items-center space-x-3 cursor-pointer transition-colors ${
                        activeCharacter?.id === character.id
                          ? "ring-2 ring-purple-500"
                          : "hover:bg-gray-700"
                      }`}
                    >
                      <img
                        src={character.image}
                        alt={character.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium">{character.name}</h4>
                        <p className="text-xs text-gray-400 truncate">
                          {character.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Interface */}
              <div className="lg:col-span-2 bg-gray-800 rounded-xl p-4 min-h-[400px] flex flex-col">
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
                              msg.isUser
                                ? "bg-purple-600 ml-auto"
                                : "bg-gray-700 mr-auto"
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
                      {isTyping && (
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                            A
                          </div>
                          <div className="bg-gray-700 p-3 rounded-lg max-w-md flex items-center">
                            <span className="dots">
                              <span>.</span>
                              <span>.</span>
                              <span>.</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Error Message */}
                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={!activeCharacter}
                      />
                      <button
                        type="submit"
                        disabled={!inputMessage.trim() || !activeCharacter}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          inputMessage.trim() && activeCharacter
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-gray-700 cursor-not-allowed"
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
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 py-8 mt-12 shadow-inner animate-fade-in">
        <div className="container mx-auto px-4 text-center text-white/70 text-base">
          <p className="mb-2">&copy; 2025 SecretAI. All rights reserved.</p>
          <div className="mt-2 space-x-6">
            <a href="#" className="hover:text-pink-400 transition-colors font-medium">
              Terms
            </a>
            <a href="#" className="hover:text-pink-400 transition-colors font-medium">
              Privacy
            </a>
            <a href="#" className="hover:text-pink-400 transition-colors font-medium">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
