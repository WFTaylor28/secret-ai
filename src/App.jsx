import React, { useState, createContext, useContext } from 'react';

// API Context Mock
const APIContext = createContext();

const App = () => {
  const [user] = useState({ id: 1, email: "user@example.com" });
  const [characters, setCharacters] = useState([
    {
      id: 1,
      ownerId: 1,
      name: "Aria",
      description: "Mysterious bard with secrets of the realm.",
      backstory: "A wandering bard who sings forgotten tales and ancient songs.",
      imageUrl: "https://picsum.photos/id/1025/300/300 ",
      public: true,
      tags: ["Fantasy", "Music"]
    },
    {
      id: 2,
      ownerId: 2,
      name: "Zephyr",
      description: "Wind spirit bound to the earth.",
      backstory: "Once a celestial being, now trapped in mortal form.",
      imageUrl: "https://picsum.photos/id/1026/300/300 ",
      public: true,
      tags: ["Mythology", "Nature"]
    },
    {
      id: 3,
      ownerId: 1,
      name: "Luna",
      description: "Guardian of dreams and night skies.",
      backstory: "Protects those who wander into the land of dreams.",
      imageUrl: "https://picsum.photos/id/1027/300/300 ",
      public: false,
      tags: ["Fantasy", "Dreams"]
    },
  ]);
  const [chats, setChats] = useState([
    {
      id: 1,
      userId: 1,
      characterId: 1,
      messages: [
        {
          id: 1,
          chatId: 1,
          sender: "character",
          text: "Hello traveler, what brings you here?",
          timestamp: new Date(),
        }
      ],
    },
  ]);

  const getPublicCharacters = () => characters.filter(c => c.public);
  const getUserCharacters = () => characters.filter(c => c.ownerId === user.id);

  const createCharacter = (newChar) => {
    const updatedChars = [...characters, { ...newChar, id: Date.now(), ownerId: user.id }];
    setCharacters(updatedChars);
  };

  const updateCharacter = (updatedChar) => {
    const updatedChars = characters.map(c => c.id === updatedChar.id ? updatedChar : c);
    setCharacters(updatedChars);
  };

  const deleteCharacter = (id) => {
    const updatedChars = characters.filter(c => c.id !== id);
    setCharacters(updatedChars);
  };

  const startChat = (charId) => {
    const existingChat = chats.find(chat => chat.characterId === charId && chat.userId === user.id);
    if (existingChat) return;

    const newChat = {
      id: Date.now(),
      userId: user.id,
      characterId: charId,
      messages: [],
    };
    setChats([...chats, newChat]);
  };

  const sendMessage = (chatId, messageText) => {
    const newMessage = {
      id: Date.now(),
      chatId,
      sender: "user",
      text: messageText,
      timestamp: new Date(),
    };

    const updatedChats = chats.map(chat =>
      chat.id === chatId
        ? { ...chat, messages: [...chat.messages, newMessage] }
        : chat
    );
    setChats(updatedChats);
  };

  return (
    <APIContext.Provider value={{
      user,
      getPublicCharacters,
      getUserCharacters,
      createCharacter,
      updateCharacter,
      deleteCharacter,
      chats,
      startChat,
      sendMessage,
    }}>
      <Main />
    </APIContext.Provider>
  );
};

const Main = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { getPublicCharacters, getUserCharacters, startChat } = useContext(APIContext);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  useEffect(() => {
    if (selectedCharacter) {
      startChat(selectedCharacter.id);
      setActiveTab('chat');
      setTimeout(() => setSelectedCharacter(null), 100);
    }
  }, [selectedCharacter]);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Header setActiveTab={setActiveTab} activeTab={activeTab} />
      <main className="container mx-auto p-4">
        {activeTab === 'home' && <HomePage onSelectCharacter={setSelectedCharacter} />}
        {activeTab === 'my-characters' && <MyCharactersPage />}
        {activeTab === 'chat' && <ChatPage />}
      </main>
    </div>
  );
};

const Header = ({ setActiveTab, activeTab }) => {
  return (
    <header className="bg-gray-800 shadow-lg">
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        <h1 className="text-2xl font-bold">AI Character Chat</h1>
        <nav className="space-x-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 rounded transition ${activeTab === 'home' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('my-characters')}
            className={`px-4 py-2 rounded transition ${activeTab === 'my-characters' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          >
            My Characters
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded transition ${activeTab === 'chat' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          >
            Chats
          </button>
        </nav>
      </div>
    </header>
  );
};

const HomePage = ({ onSelectCharacter }) => {
  const { getPublicCharacters } = useContext(APIContext);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCharacters = getPublicCharacters().filter(char =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section>
      <h2 className="text-3xl font-semibold mb-4">Public AI Characters</h2>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search characters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCharacters.length > 0 ? (
          filteredCharacters.map((char) => (
            <CharacterCard key={char.id} character={char} onChat={() => onSelectCharacter(char)} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-400">No characters found.</p>
        )}
      </div>
    </section>
  );
};

const CharacterCard = ({ character, onChat }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <img src={character.imageUrl} alt={character.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-semibold">{character.name}</h3>
        <div className="flex flex-wrap mt-1 gap-1">
          {character.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-700 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-gray-400 mt-1">{character.description}</p>
        <button
          onClick={onChat}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
        >
          Chat Now
        </button>
      </div>
    </div>
  );
};

const MyCharactersPage = () => {
  const { getUserCharacters, createCharacter } = useContext(APIContext);
  const [showModal, setShowModal] = useState(false);
  const [newChar, setNewChar] = useState({
    name: "",
    description: "",
    backstory: "",
    imageUrl: "https://picsum.photos/300/300?random=1",
    public: false,
    tags: ["Fantasy"],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewChar(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewChar(prev => ({ ...prev, imageUrl: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createCharacter(newChar);
    setNewChar({
      name: "",
      description: "",
      backstory: "",
      imageUrl: " https://picsum.photos/300/300?random=1",
      public: false,
      tags: ["Fantasy"],
    });
    setShowModal(false);
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold">My Characters</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
        >
          Create New Character
        </button>
      </div>

      {getUserCharacters().length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {getUserCharacters().map(char => (
            <CharacterCard key={char.id} character={char} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center">You haven't created any characters yet.</p>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Create New Character</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Character Name"
                value={newChar.name}
                onChange={handleChange}
                required
                className="w-full p-3 mb-3 bg-gray-700 rounded"
              />
              <input
                type="text"
                name="description"
                placeholder="Short Description"
                value={newChar.description}
                onChange={handleChange}
                required
                className="w-full p-3 mb-3 bg-gray-700 rounded"
              />
              <textarea
                name="backstory"
                placeholder="Backstory"
                value={newChar.backstory}
                onChange={handleChange}
                required
                className="w-full p-3 mb-3 bg-gray-700 rounded"
                rows="4"
              ></textarea>
              <label className="block mb-3">
                Public:
                <input
                  type="checkbox"
                  name="public"
                  checked={newChar.public}
                  onChange={handleChange}
                  className="ml-2"
                />
              </label>
              <label className="block mb-3">
                Tags:
                <select
                  name="tags"
                  multiple
                  value={newChar.tags}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 bg-gray-700 rounded"
                >
                  <option value="Fantasy">Fantasy</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Historical">Historical</option>
                  <option value="Horror">Horror</option>
                  <option value="Romance">Romance</option>
                  <option value="Comedy">Comedy</option>
                </select>
              </label>
              <label className="block mb-3">
                Avatar:
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
              </label>
              {newChar.imageUrl && (
                <div className="mb-3">
                  <img src={newChar.imageUrl} alt="Preview" className="w-32 h-32 object-cover rounded" />
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

const ChatPage = () => {
  const { chats, sendMessage } = useContext(APIContext);
  const [selectedChat, setSelectedChat] = useState(chats[0] || null);
  const [messageInput, setMessageInput] = useState("");

  const selectedCharacter = selectedChat
    ? useContext(APIContext).getPublicCharacters().find(c => c.id === selectedChat.characterId)
    : null;

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessage(selectedChat.id, messageInput);
    setMessageInput("");
  };

  return (
    <section className="flex h-[calc(100vh-12rem)]">
      <div className="w-1/3 bg-gray-800 p-4 rounded-tl-lg rounded-bl-lg">
        <h2 className="text-2xl font-semibold mb-4">Chats</h2>
        <ul>
          {chats.length > 0 ? (
            chats.map(chat => {
              const char = useContext(APIContext).getPublicCharacters().find(c => c.id === chat.characterId);
              return (
                <li
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`cursor-pointer p-3 mb-2 rounded ${
                    selectedChat?.id === chat.id ? "bg-gray-700" : "hover:bg-gray-700"
                  }`}
                >
                  {char ? char.name : "Unknown Character"}
                </li>
              );
            })
          ) : (
            <p className="text-gray-400">No chats yet.</p>
          )}
        </ul>
      </div>
      <div className="w-2/3 bg-gray-900 p-4 rounded-tr-lg rounded-br-lg flex flex-col">
        {selectedChat && selectedCharacter ? (
          <>
            <div className="flex items-center mb-4 pb-2 border-b border-gray-700">
              <img
                src={selectedCharacter.imageUrl}
                alt={selectedCharacter.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <h3 className="text-xl font-semibold">{selectedCharacter.name}</h3>
            </div>
            <div className="flex-grow overflow-y-auto mb-4 pr-2">
              {selectedChat.messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === "user" ? "bg-blue-600" : "bg-gray-700"
                    }`}
                  >
                    {msg.text}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder="Type your message..."
                className="flex-grow p-3 bg-gray-800 rounded-l focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 px-4 py-3 rounded-r hover:bg-blue-700 transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a chat to begin messaging.
          </div>
        )}
      </div>
    </section>
  );
};

export default App;
