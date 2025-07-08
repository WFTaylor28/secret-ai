import React, { useState } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import Home from "./Home";
import CreateCharacter from "./CreateCharacter";
import Chat from "./Chat";
import MyChats from "./MyChats";

// Glassmorphism and animation helpers
const glass = "backdrop-blur-md bg-white/10 border border-white/20 shadow-xl";
const fadeIn = "transition-all duration-500 ease-in-out";

const App = () => {
  // My Characters modal
  const [showMyCharacters, setShowMyCharacters] = useState(false);
  const [editCharacter, setEditCharacter] = useState(null); // character object or null
  // Chat memory modal and per-character memory
  const [showChatMemory, setShowChatMemory] = useState(false);
  const [chatMemoryCharacterId, setChatMemoryCharacterId] = useState(null);
  const [chatMemories, setChatMemories] = useState({}); // { [characterId]: memoryText }
  const [chatMemoryText, setChatMemoryText] = useState("");
  const [showPrivacy, setShowPrivacy] = useState(false);
  // Modal states
  const [showTerms, setShowTerms] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  // State for hamburger/vertical dots menu
  const [showMenu, setShowMenu] = useState(false);
  // Mock user data
  const [user] = useState({
    id: 1,
    username: "User123",
    characters: [
      {
        id: 1,
        name: "Aiko",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        description: "A bubbly, expressive college student who loves teasing her friends and is always up for a challenge.",
        isPublic: true,
        nsfw: false,
      },
      {
        id: 2,
        name: "Jasper",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        description: "A sarcastic but secretly soft-hearted barista with a knack for witty banter and dramatic eye rolls.",
        isPublic: true,
        nsfw: false,
      },
      {
        id: 3,
        name: "Mina",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
        description: "A mysterious, artistic soul who expresses herself through subtle gestures and intense gazes.",
        isPublic: true,
        nsfw: false,
      },
      {
        id: 4,
        name: "Kai",
        image: "https://randomuser.me/api/portraits/men/65.jpg",
        description: "A playful, energetic dancer who can't sit still and loves to make people laugh with silly antics.",
        isPublic: true,
        nsfw: false,
      },
    ],
  });


  // Chat sessions: [{ characterId, messages: [], lastActive, ... }]
  const [chatSessions, setChatSessions] = useState([]);

  // Character creation form state
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    image: null,
    description: "",
    scenario: "",
    isPublic: false,
    nsfw: false,
  });

  // Track created characters in state
  const [createdCharacters, setCreatedCharacters] = useState([]);


  // Chat UI state (for /chat/:characterId)
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [pendingAI, setPendingAI] = useState(null); // For animating AI reply

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
    setCreatedCharacters((prev) => [...prev, createdCharacter]);
    alert(`Character "${createdCharacter.name}" created successfully!`);
    setNewCharacter({
      name: "",
      image: null,
      description: "",
      scenario: "",
      isPublic: false,
      nsfw: false,
    });
  };

  // Send message in chat (for /chat/:characterId)
  const handleSendMessage = async (characterId, e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Find or create chat session
    let session = chatSessions.find((s) => s.characterId === characterId);
    if (!session) {
      session = {
        characterId,
        messages: [],
        lastActive: new Date(),
      };
      setChatSessions((prev) => [...prev, session]);
    }

    const userMessage = { text: inputMessage, isUser: true };
    // Add user message
    setChatSessions((prev) =>
      prev.map((s) =>
        s.characterId === characterId
          ? { ...s, messages: [...s.messages, userMessage], lastActive: new Date() }
          : s
      )
    );
    setInputMessage("");
    setIsTyping(true);
    setError("");
    setPendingAI(null);

    try {
      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const BACKEND_URL = isLocal
        ? "/chat"
        : "https://secret-ai-uz8m.onrender.com/chat";

      // Show ... bubble while waiting
      setPendingAI({ text: "", isUser: false, thinking: true });

      // Prepare chat history for backend (last 8 messages)
      let sessionMessages = session ? session.messages : [];
      // Add the new user message (not yet in session)
      sessionMessages = [...sessionMessages, userMessage];
      // Only send the last 8 messages (4 exchanges)
      const history = sessionMessages.slice(-8);

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.text,
          character: user.characters.find((c) => c.id === characterId),
          history,
        }),
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();

      // Defensive: check for valid reply
      const fullText = (data && typeof data.reply === "string") ? data.reply.trim() : "";
      if (!fullText) {
        setError("AI did not return a response. Please try again.");
        setPendingAI(null);
        return;
      }

      // Animate AI reply letter by letter
      let i = 0;
      setPendingAI({ text: "", isUser: false, thinking: false });
      const typeWriter = () => {
        setPendingAI({ text: fullText.slice(0, i + 1), isUser: false, thinking: false });
        if (i < fullText.length - 1) {
          i++;
          setTimeout(typeWriter, 18); // typing speed
        } else {
          setChatSessions((prev) =>
            prev.map((s) =>
              s.characterId === characterId
                ? { ...s, messages: [...s.messages, { text: fullText, isUser: false }], lastActive: new Date() }
                : s
            )
          );
          setPendingAI(null);
        }
      };
      if (fullText.length > 0) {
        setTimeout(typeWriter, 400); // short pause after ...
      }
    } catch (err) {
      setError("Failed to get a response from AI. Please try again.");
      setPendingAI(null);
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

  // Filtered characters (include new and created)
  const allCharacters = [...user.characters, ...createdCharacters];
  const publicCharacters = allCharacters.filter((c) => c.isPublic);
  const privateCharacters = allCharacters.filter((c) => !c.isPublic);

  const navigate = useNavigate();

  // Navigation handlers
  const goHome = () => navigate("/");
  const goCreate = () => navigate("/create");
  const goMyChats = () => navigate("/my-chats");

  // Open chat with character (from anywhere)
  const openChatWithCharacter = (characterId) => {
    navigate(`/chat/${characterId}`);
  };

  // Delete chat session
  const handleDeleteChat = (characterId) => {
    setChatSessions((prev) => prev.filter((s) => s.characterId !== characterId));
  };

  // Get chat session for a character
  const getChatSession = (characterId) =>
    chatSessions.find((s) => s.characterId === characterId) || { messages: [] };

  // Prepare chatSessions for MyChats page
  const myChatSessions = chatSessions.map((s) => {
    const character = user.characters.find((c) => c.id === s.characterId);
    const lastMessage = s.messages.length > 0 ? s.messages[s.messages.length - 1].text : null;
    return {
      character,
      lastMessage,
      lastActive: s.lastActive,
      messageCount: s.messages.length,
    };
  }).filter((s) => s.character); // Only show if character still exists

  // Handler to open chat memory modal for a character
  const handleShowChatMemory = (characterId) => {
    setChatMemoryCharacterId(characterId);
    setChatMemoryText(chatMemories[characterId] || "");
    setShowChatMemory(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1333] via-[#2d1e4f] to-[#0f051d] text-white flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="w-full bg-gradient-to-r from-purple-900/80 to-indigo-900/80 shadow-lg z-20 sticky top-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-6">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg cursor-pointer select-none" onClick={goHome}>
              SecretAI
            </span>
            <button
              onClick={goHome}
              className={`hidden md:inline text-base font-medium px-4 py-2 rounded-full transition-all ${window.location.pathname === "/" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" : "text-purple-200 hover:bg-purple-800/30"}`}
            >
              Home
            </button>
            <button
              onClick={() => setShowMyCharacters(true)}
              className="hidden md:inline text-base font-medium px-4 py-2 rounded-full transition-all text-purple-200 hover:bg-purple-800/30"
            >
              My Characters
            </button>
            <button
              onClick={goMyChats}
              className={`hidden md:inline text-base font-medium px-4 py-2 rounded-full transition-all ${window.location.pathname === "/my-chats" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" : "text-purple-200 hover:bg-purple-800/30"}`}
            >
              My Chats
            </button>
            <button
              onClick={goCreate}
              className={`hidden md:inline text-base font-medium px-4 py-2 rounded-full transition-all ${window.location.pathname === "/create" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" : "text-purple-200 hover:bg-purple-800/30"}`}
            >
              Create Character
            </button>
          </div>
          {/* Hamburger/Vertical Dots Menu */}
          <div className="relative">
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-purple-800/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
              onClick={() => setShowMenu((prev) => !prev)}
              aria-label="Open account menu"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl bg-gradient-to-br from-[#2d1e4f] to-[#1a1333] border border-white/10 z-50 animate-fade-in">
                <div className="py-2">
                  <div className="px-5 py-2 text-sm text-white/80 font-semibold border-b border-white/10">Account</div>
                  <button className="w-full text-left px-5 py-2 hover:bg-purple-800/30 transition-colors text-white/90" onClick={() => { setShowProfile(true); setShowMenu(false); }}>Profile</button>
                  <button className="w-full text-left px-5 py-2 hover:bg-purple-800/30 transition-colors text-white/90" onClick={() => { setShowSettings(true); setShowMenu(false); }}>Settings</button>
                  <button className="w-full text-left px-5 py-2 hover:bg-purple-800/30 transition-colors text-white/90" onClick={() => { setShowBilling(true); setShowMenu(false); }}>Billing</button>
                  <div className="border-t border-white/10 my-2" />
                  <button className="w-full text-left px-5 py-2 hover:bg-pink-700/40 transition-colors text-pink-300 font-semibold">Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Header (Home only) */}
      {window.location.pathname === "/" && (
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
                  onClick={goMyChats}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-semibold shadow-lg transition-all transform hover:scale-105"
                >
                  My Chats
                </button>
                <button
                  onClick={goCreate}
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
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 w-full ${window.location.pathname.startsWith('/chat/') ? 'flex justify-center items-center bg-gradient-to-br from-[#1a1333] via-[#2d1e4f] to-[#0f051d] p-0' : 'container mx-auto px-4 py-8'}`}>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                onStartChat={() => {}}
                onCreateCharacter={goCreate}
                publicCharacters={publicCharacters}
                setActiveCharacter={(character) => openChatWithCharacter(character.id)}
              />
            }
          />
          <Route
            path="/create"
            element={
              <CreateCharacter
                newCharacter={newCharacter}
                handleInputChange={handleInputChange}
                handleImageChange={handleImageChange}
                handleSubmit={handleSubmit}
              />
            }
          />
          <Route
            path="/my-chats"
            element={
              <MyChats
                user={user}
                chatSessions={myChatSessions}
                onContinueChat={openChatWithCharacter}
                onDeleteChat={handleDeleteChat}
              />
            }
          />
          <Route
            path="/chat/:characterId"
            element={<ChatPage
              user={user}
              getChatSession={getChatSession}
              handleSendMessage={handleSendMessage}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              isTyping={isTyping}
              pendingAI={pendingAI}
              onShowChatMemory={handleShowChatMemory}
            />}
          />
        </Routes>
      </main>
      {/* My Characters Modal */}
      {showMyCharacters && (
        <Modal onClose={() => { setShowMyCharacters(false); setEditCharacter(null); }} title="My Characters">
          <div className="space-y-4">
            {user.characters.length === 0 ? (
              <div className="text-white/70">You have not created any characters yet.</div>
            ) : (
              <ul className="space-y-2">
                {user.characters.map((char) => (
                  <li key={char.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-3">
                      <img src={char.image} alt={char.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                      <div>
                        <div className="font-semibold text-white">{char.name}</div>
                        <div className="text-xs text-white/60">{char.description}</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 rounded bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold" onClick={() => setEditCharacter(char)}>Edit</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Modal>
      )}

      {/* Edit Character Modal */}
      {editCharacter && (
        <Modal onClose={() => setEditCharacter(null)} title={`Edit Character: ${editCharacter.name}`}>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); setEditCharacter(null); }}>
            <div>
              <label className="block text-sm font-semibold mb-1">Name</label>
              <input className="w-full rounded px-3 py-2 bg-white/10 text-white" value={editCharacter.name} onChange={e => setEditCharacter({ ...editCharacter, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Description</label>
              <textarea className="w-full rounded px-3 py-2 bg-white/10 text-white" value={editCharacter.description} onChange={e => setEditCharacter({ ...editCharacter, description: e.target.value })} />
            </div>
            <div className="flex gap-2 items-center">
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={editCharacter.isPublic} onChange={e => setEditCharacter({ ...editCharacter, isPublic: e.target.checked })} /> Public</label>
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={editCharacter.nsfw} onChange={e => setEditCharacter({ ...editCharacter, nsfw: e.target.checked })} /> NSFW</label>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white" onClick={() => setEditCharacter(null)}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 text-white font-semibold">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Chat Memory Modal */}
      {showChatMemory && (
        <Modal onClose={() => setShowChatMemory(false)} title="Chat Memory">
          <div className="space-y-4">
            <textarea
              className="w-full rounded px-3 py-2 bg-white/10 text-white min-h-[180px]"
              value={chatMemoryText}
              onChange={e => setChatMemoryText(e.target.value)}
              placeholder="Type memory or context for this character here. The AI will use this as reference."
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white" onClick={() => setShowChatMemory(false)}>Close</button>
              <button
                className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 text-white font-semibold"
                onClick={() => {
                  setChatMemories(prev => ({ ...prev, [chatMemoryCharacterId]: chatMemoryText }));
                  setShowChatMemory(false);
                }}
              >Save</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 py-8 mt-12 shadow-inner animate-fade-in">
        <div className="container mx-auto px-4 text-center text-white/70 text-base">
          <p className="mb-2">&copy; 2025 SecretAI. All rights reserved.</p>
          <div className="mt-2 space-x-6 flex flex-wrap justify-center items-center gap-4">
            <button
              className="hover:text-pink-400 transition-colors font-medium"
              onClick={() => setShowTerms(true)}
            >
              Terms
            </button>
            {/* Privacy and Contact as buttons for valid JSX */}
            <button className="hover:text-pink-400 transition-colors font-medium" onClick={() => setShowPrivacy(true)}>Privacy</button>
            <button className="hover:text-pink-400 transition-colors font-medium">Contact</button>
          </div>
        </div>
      </footer>
      {/* Terms Modal */}
      {showTerms && (
        <Modal onClose={() => setShowTerms(false)} title="Terms of Service">
          <div className="space-y-4 text-left text-white/90">
            <p>
              Welcome to SecretAI. By using this service, you agree to the following terms:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Any character created or represented as underage will be taken down immediately.</li>
              <li>Do not create or share illegal, harmful, or offensive content.</li>
              <li>Respect the privacy and rights of others.</li>
              <li>We reserve the right to remove any content or account at our discretion.</li>
            </ul>
          </div>
        </Modal>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <Modal onClose={() => setShowPrivacy(false)} title="Privacy Policy">
          <div className="space-y-4 text-left text-white/90">
            <p>
              <strong>Privacy Policy</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your data is never sold or shared with third parties.</li>
              <li>Conversations and character data are stored securely and used only to provide the service.</li>
              <li>You may request deletion of your data at any time.</li>
              <li>We use cookies only for essential site functionality.</li>
            </ul>
          </div>
        </Modal>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <Modal onClose={() => setShowProfile(false)} title="Profile">
          <div className="space-y-2 text-left">
            <div><span className="font-semibold">Username:</span> {user.username}</div>
            <div><span className="font-semibold">User ID:</span> {user.id}</div>
            <div><span className="font-semibold">Characters:</span> {user.characters.length}</div>
            <div className="text-xs text-white/60">Profile editing coming soon.</div>
          </div>
        </Modal>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Modal onClose={() => setShowSettings(false)} title="Settings">
          <div className="space-y-2 text-left">
            <div className="text-white/80">Settings options coming soon.</div>
          </div>
        </Modal>
      )}

      {/* Billing Modal */}
      {showBilling && (
        <Modal onClose={() => setShowBilling(false)} title="Billing">
          <div className="space-y-2 text-left">
            <div className="text-white/80">Billing and subscription management coming soon.</div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// --- Modal Component ---
function Modal({ onClose, title, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gradient-to-br from-[#2d1e4f] to-[#1a1333] rounded-2xl shadow-2xl border border-white/10 p-6 w-full max-w-lg mx-4 relative animate-fade-in">
        <button
          className="absolute top-3 right-3 text-white/60 hover:text-pink-400 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white/90">{title}</h2>
        {children}
      </div>
    </div>
  );
}

// ChatPage component for /chat/:characterId
function ChatPage({ user, getChatSession, handleSendMessage, inputMessage, setInputMessage, isTyping, pendingAI, onShowChatMemory }) {
  const { characterId } = useParams();
  const character = user.characters.find((c) => c.id === Number(characterId));
  const session = getChatSession(Number(characterId));
  if (!character) {
    return <div className="text-center text-red-400 py-12">Character not found.</div>;
  }
  // Fullscreen chat experience
  return (
    <div className="w-full h-[80vh] md:h-[85vh] flex items-center justify-center relative">
      <div className="w-full max-w-3xl h-full flex flex-col bg-gradient-to-br from-[#2d1e4f] to-[#1a1333] rounded-3xl shadow-2xl border border-white/10 p-0 md:p-4 relative">
        <button
          className="absolute top-4 right-4 z-20 px-3 py-1 rounded bg-pink-700 hover:bg-pink-800 text-white text-xs font-semibold shadow"
          onClick={() => onShowChatMemory(character.id)}
        >
          Chat Memory
        </button>
        <Chat
          user={user}
          activeCharacter={character}
          setActiveCharacter={(char) => {
            if (char && char.id !== character.id) {
              // Navigate to the selected character's chat
              window.location.hash = `#/chat/${char.id}`;
            }
          }}
          messages={session.messages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={(e) => handleSendMessage(Number(characterId), e)}
          isTyping={isTyping}
          pendingAI={pendingAI}
        />
      </div>
    </div>
  );
}

export default App;
