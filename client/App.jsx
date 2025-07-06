import React, { useState } from "react";

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

    try {
      // Simulating API request delay and logic
      const response = await getMockAIResponse(inputMessage);
      setMessages((prev) => [...prev, { text: response, isUser: false }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  // More realistic mock AI response generator
  const getMockAIResponse = (message) => {
    const personality = activeCharacter?.description.toLowerCase() || "";
    let basePrompt = `You are ${activeCharacter?.name}, ${personality}. The user said: "${message}". Respond naturally.`;

    if (activeCharacter.nsfw) {
      basePrompt += " You can be bold and expressive.";
    } else {
      basePrompt += " Keep your tone friendly and appropriate.";
    }

    const aiResponses = [
      `${activeCharacter.name}: That's an interesting question.`,
      `${activeCharacter.name}: Let me think about how to respond...`,
      `${activeCharacter.name}: I'd love to explore that topic with you.`,
      `${activeCharacter.name}: Can you tell me more?`,
      `${activeCharacter.name}: Fascinating!`,
    ];

    return aiResponses[Math.floor(Math.random() * aiResponses.length)];
  };

  // Filtered characters based on tab
  const publicCharacters = user.characters.filter((c) => c.isPublic);
  const privateCharacters = user.characters.filter((c) => !c.isPublic);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 shadow-sm sticky top-0 z-10 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            SecretAI
          </h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <button
                  onClick={() => setActiveTab("home")}
                  className={`py-2 ${
                    activeTab === "home"
                      ? "text-purple-400 border-b-2 border-purple-400"
                      : "hover:text-purple-300 transition-colors"
                  }`}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("my-characters")}
                  className={`py-2 ${
                    activeTab === "my-characters"
                      ? "text-purple-400 border-b-2 border-purple-400"
                      : "hover:text-purple-300 transition-colors"
                  }`}
                >
                  My Characters
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`py-2 ${
                    activeTab === "chat"
                      ? "text-purple-400 border-b-2 border-purple-400"
                      : "hover:text-purple-300 transition-colors"
                  }`}
                >
                  Chat
                </button>
              </li>
            </ul>
          </nav>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">Welcome, {user.username}</span>
            <button
              onClick={() => setActiveTab("my-characters")}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full transition-colors"
            >
              Create Character
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Home Tab */}
        {activeTab === "home" && (
          <section>
            <h2 className="text-3xl font-bold mb-6">Public Characters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicCharacters.map((character) => (
                <div
                  key={character.id}
                  className="bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300 group"
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
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{character.name}</h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {character.description}
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab("chat");
                        setActiveCharacter(character);
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg transition-colors"
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
                      className="bg-gray-900 rounded-xl overflow-hidden shadow-lg"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={character.image}
                          alt={character.name}
                          className="w-full h-full object-cover"
                        />
                        {character.nsfw && (
                          <div className="absolute top-2 right-2 bg-red-600 text-xs font-bold px-2 py-1 rounded-full">
                            NSFW
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold mb-2">{character.name}</h3>
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
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
                  <div className="col-span-full text-center py-8 bg-gray-900 rounded-lg">
                    <p className="text-gray-400">You don't have any public characters yet.</p>
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
                      className="bg-gray-900 rounded-xl overflow-hidden shadow-lg"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={character.image}
                          alt={character.name}
                          className="w-full h-full object-cover"
                        />
                        {character.nsfw && (
                          <div className="absolute top-2 right-2 bg-red-600 text-xs font-bold px-2 py-1 rounded-full">
                            NSFW
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold mb-2">{character.name}</h3>
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
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
                  <div className="col-span-full text-center py-8 bg-gray-900 rounded-lg">
                    <p className="text-gray-400">You don't have any private characters yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Character Creation Form */}
            <div className="mt-12 p-6 bg-gray-900 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Create New Character</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Character Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newCharacter.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter character name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Character Image</label>
                  <div className="flex items-center space-x-4">
                    {newCharacter.image ? (
                      <img
                        src={newCharacter.image}
                        alt="Preview"
                        className="w-20 h-20 rounded object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-800 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs text-center">No image</span>
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
                  <label className="block text-sm font-medium mb-1">Backstory / Description</label>
                  <textarea
                    name="description"
                    value={newCharacter.description}
                    onChange={handleInputChange}
                    rows={3}
                    required
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                          className={`flex ${
                            msg.isUser ? "justify-end" : "justify-start"
                          } items-start`}
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
                                : "bg-gray-800 mr-auto"
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
                          <div className="bg-gray-800 p-3 rounded-lg max-w-md flex items-center">
                            <span className="dots">
                              <span>.</span>
                              <span>.</span>
                              <span>.</span>
                            </span>
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
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2025 SecretAI. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
