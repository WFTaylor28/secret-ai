import React, { useEffect, useRef } from "react";
// Helper to render chat message formatting (actions/expressions/thoughts)
function renderFormattedMessage(text, isUser) {
  // *action* or **action** to <em>
  // For user, use a different class for <em>
  // Robustly match both *action* and **action** (not followed by colon), hide asterisks
  // Handles overlapping and nested asterisks, and does not match inside words
  const emoteRegex = /(^|\s)(\*\*([^*][^*]*?)\*\*|\*([^*][^*]*?)\*)(?!:)/g;
  text = text.replace(emoteRegex, (match, pre, _all, double, single) => {
    const emoteText = double || single;
    const cls = isUser ? 'user-action' : 'ai-action';
    return `${pre}<em class=\"${cls}\">${emoteText}</em>`;
  });

  // Remove all [TAG: ...] tags (including multimodal and custom tags) but keep the content, rendered in italics
  text = text.replace(/\[\s*([A-Z]+)\s*:(.*?)\]/g, (match, tag, content) => {
    return content.trim() ? `<em>${content.trim()}</em>` : '';
  });

  // Remove any [TAG] (no colon/content) tags entirely
  text = text.replace(/\[\s*([A-Z]+)\s*\]/g, '');

  // _inner thoughts_ to <em class="ai-action">"..."</em> for AI, or user-action for user
  // Only if not already inside *...* or **...**
  // This will match _..._ (not inside words)
  text = text.replace(/(^|\s)_([^_]+)_($|\s|[.!?,;:])/g, (match, pre, inner, post) => {
    const cls = isUser ? 'user-action' : 'ai-action';
    // Wrap inner thought in real double quotes
    return `${pre}<em class=\"${cls}\">\"${inner.trim()}\"</em>${post}`;
  });

  // *action* or **action** to <em> (already handled above)
  // [brackets] to <span class="action">[...]]</span> (fallback for non-sensory brackets)
  text = text.replace(/\[(.+?)\]/g, '<span class="action">[$1]</span>');
  return { __html: text };
}

const Chat = ({
  user = { characters: [] },
  activeCharacter,
  setActiveCharacter,
  messages,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isTyping,
  pendingAI,
  chatSessions = [],
  allCharacters = [],
  onRegenerate,
  onEditMessage,
}) => {
  // Ref for the message list container
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const aiTypewriterRef = useRef(null);

  // Auto-scroll the AI typewriter bubble when AI is typing out the response
  useEffect(() => {
    if (pendingAI && !pendingAI.thinking && aiTypewriterRef.current) {
      aiTypewriterRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [pendingAI]);

  // Track which message is being edited and its draft text
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editDraft, setEditDraft] = React.useState("");

  // Handler to start editing a message
  const handleEditClick = (idx) => {
    setEditingIndex(idx);
    setEditDraft(messages[idx].text);
    // Do NOT delete or modify the message here
  };

  // Handler to save edited message
  const handleEditSave = (idx) => {
    if (onEditMessage) {
      onEditMessage(idx, editDraft);
    }
    setEditingIndex(null);
    setEditDraft("");
  };

  // Handler to cancel editing
  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditDraft("");
  };

  // Handler for regenerate button
  const handleRegenerate = (aiMsgIndex) => {
    console.log('[Regenerate] Button clicked for AI message index:', aiMsgIndex);
    // Find the most recent user message before this AI message
    let userMsgIndex = aiMsgIndex - 1;
    while (userMsgIndex >= 0 && !messages[userMsgIndex].isUser) {
      userMsgIndex--;
    }
    if (userMsgIndex >= 0) {
      // Remove the AI message to be regenerated in parent state
      if (onRegenerate) {
        onRegenerate(aiMsgIndex);
      }
      // Pass the correct user message text directly to handleSendMessage
      const userText = messages[userMsgIndex].text;
      console.log('[Regenerate] Calling handleSendMessage with:', { characterId: activeCharacter?.id, userText });
      const fakeEvent = { preventDefault: () => {} };
      if (typeof fakeEvent.preventDefault === 'function') fakeEvent.preventDefault();
      handleSendMessage(activeCharacter?.id, fakeEvent, { regenerate: true, text: userText });
      setInputMessage("");
    }
    setEditingIndex(null);
    setEditDraft("");
  };

  return (
    <section className="w-full max-w-3xl mx-auto px-2 sm:px-4 md:px-8 py-4 md:py-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center md:text-left hidden md:block">Your Chats</h2>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Character List - hidden on mobile, visible on md+ */}
        <div className="hidden md:block md:w-1/3">
          <h3 className="text-lg font-semibold mb-2">Characters</h3>
          <div className="space-y-2 max-h-[32rem] overflow-y-auto pr-2">
            {chatSessions.length === 0 ? (
              <div className="text-gray-400 text-center py-8">You have no chats yet.</div>
            ) : (
              chatSessions.map((session) => {
                const character = allCharacters.find(c => c.id === session.characterId);
                if (!character) return null;
                return (
                  <div
                    key={character.id}
                    onClick={() => setActiveCharacter(character)}
                    className={`relative bg-gray-900 p-3 rounded-xl flex items-center space-x-3 cursor-pointer transition-all duration-150 border-2 ${
                      activeCharacter?.id === character.id
                        ? "border-pink-400 shadow-lg ring-2 ring-pink-400"
                        : "border-transparent hover:bg-gray-800"
                    }`}
                    style={{ boxSizing: 'border-box' }}
                  >
                    <img
                      src={character.image || character.imageUrl || 'https://via.placeholder.com/128x128?text=No+Image'}
                      alt={character.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/128x128?text=Image+Error';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{character.name}</h4>
                      <p className="text-xs text-gray-400 truncate">{character.description}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* Chat Interface - always visible, full width on mobile */}
        <div className="w-full max-w-3xl mx-auto bg-gray-900 rounded-xl p-2 sm:p-4 h-[600px] flex flex-col">
          {!activeCharacter ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a character to start chatting.
            </div>
          ) : (
            <>
              {/* Chat header: avatar and name, always visible */}
              <div className="flex flex-col">
                {/* On mobile, render the tab buttons above avatar/name inside the chat interface only */}
                <div className="mb-2 md:hidden">
                  {/* TODO: Insert the real tab buttons here (e.g., <TabButtons /> or similar) */}
                </div>
                <div className="flex items-center p-2 border-b border-gray-700 mb-2">
                  <img
                    src={activeCharacter.image}
                    alt={activeCharacter.name}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <h4 className="font-semibold">{activeCharacter.name}</h4>
                </div>
                {/* On desktop, do not render tab buttons here */}
              </div>
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 max-h-[420px]"
                ref={messagesContainerRef}
              >
                {messages.map((msg, index) => (
                  <div key={index}>
                    <div className={`flex items-start ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                      {/* Avatar/profile: always same size for user and character */}
                      {msg.isUser ? (
                        <div className="flex items-center">
                          <div className="order-2 flex-shrink-0 ml-2">
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold border border-blue-400">
                              U
                            </div>
                          </div>
                          <div className="order-1 ml-3">
                            {/* Inline edit mode for user message */}
                            {editingIndex === index ? (
                              <div className="max-w-md px-4 py-2 rounded-lg bg-gray-800" style={{ color: '#fff' }}>
                                <textarea
                                  className="w-full bg-gray-900 text-white rounded p-2 mb-2 resize-none"
                                  value={editDraft}
                                  onChange={e => setEditDraft(e.target.value)}
                                  rows={2}
                                  autoFocus
                                />
                                <div className="flex justify-end space-x-2">
                                  <button
                                    className="px-3 py-1 rounded bg-pink-500 text-white hover:bg-pink-600"
                                    onClick={() => handleEditSave(index)}
                                  >Save</button>
                                  <button
                                    className="px-3 py-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-600"
                                    onClick={handleEditCancel}
                                  >Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div
                                  className="max-w-md px-4 py-2 rounded-lg"
                                  style={{ background: '#23272f', color: '#fff' }}
                                >
                                  <p className="text-sm" dangerouslySetInnerHTML={renderFormattedMessage(msg.text, true)} />
                                </div>
                                {/* Edit icon directly under bubble for sent messages only (not typing or pendingAI) */}
                                {(!isTyping && !pendingAI) && (
                                  <div className="flex justify-end mt-1">
                                    <button
                                      className="p-1 rounded hover:bg-gray-700"
                                      style={{ background: 'none', border: 'none' }}
                                      title="Edit message"
                                      onClick={() => handleEditClick(index)}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#888" viewBox="0 0 16 16">
                                        <path d="M12.146 2.146a.5.5 0 0 1 .708 0l1 1a.5.5 0 0 1 0 .708l-8.5 8.5a.5.5 0 0 1-.168.11l-3 1a.5.5 0 0 1-.638-.638l1-3a.5.5 0 0 1 .11-.168l8.5-8.5zm1.708 1.708L13 3.207 12.793 3 13.854 4.061l.001-.001zm-1.061-1.061L11.793 2 3.5 10.293l-.707.707-1 3 3-1 .707-.707L14 4.207l-.207-.207z"/>
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          <img
                            src={activeCharacter.image}
                            alt={activeCharacter.name}
                            className="w-12 h-12 rounded-full object-cover mr-2 border border-purple-600 bg-gray-900 flex-shrink-0"
                          />
                          <div>
                            {/* Inline edit mode for character message */}
                            {editingIndex === index ? (
                              <div className="max-w-md px-4 py-2 rounded-lg bg-gray-800" style={{ color: '#fff' }}>
                                <textarea
                                  className="w-full bg-gray-900 text-white rounded p-2 mb-2 resize-none"
                                  value={editDraft}
                                  onChange={e => setEditDraft(e.target.value)}
                                  rows={2}
                                  autoFocus
                                />
                                <div className="flex justify-end space-x-2">
                                  <button
                                    className="px-3 py-1 rounded bg-pink-500 text-white hover:bg-pink-600"
                                    onClick={() => handleEditSave(index)}
                                  >Save</button>
                                  <button
                                    className="px-3 py-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-600"
                                    onClick={handleEditCancel}
                                  >Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div
                                  className="max-w-md px-4 py-2 rounded-lg"
                                  style={{ background: '#23272f', color: '#fff' }}
                                >
                                  <p className="text-sm" dangerouslySetInnerHTML={renderFormattedMessage(msg.text, false)} />
                                </div>
                                {/* Edit icon directly under bubble for sent messages only (not typing or pendingAI) */}
                                {(!isTyping && !pendingAI) && (
                                  <div className="flex justify-start mt-1 space-x-2">
                                    <button
                                      className="p-1 rounded hover:bg-gray-700"
                                      style={{ background: 'none', border: 'none' }}
                                      title="Edit message"
                                      onClick={() => handleEditClick(index)}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#888" viewBox="0 0 16 16">
                                        <path d="M12.146 2.146a.5.5 0 0 1 .708 0l1 1a.5.5 0 0 1 0 .708l-8.5 8.5a.5.5 0 0 1-.168.11l-3 1a.5.5 0 0 1-.638-.638l1-3a.5.5 0 0 1 .11-.168l8.5-8.5zm1.708 1.708L13 3.207 12.793 3 13.854 4.061l.001-.001zm-1.061-1.061L11.793 2 3.5 10.293l-.707.707-1 3 3-1 .707-.707L14 4.207l-.207-.207z"/>
                                      </svg>
                                    </button>
                                    {/* Regenerate button: only for most recent AI message, not first, not typing/pendingAI */}
                                    {index === messages.length - 1 && !msg.isUser && index !== 0 && (!isTyping && !pendingAI) && (
                                      <button
                                        className="p-1 rounded hover:bg-gray-700"
                                        style={{ background: 'none', border: 'none' }}
                                        title="Regenerate response"
                                        onClick={() => handleRegenerate(index)}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#888" viewBox="0 0 16 16">
                                          <path d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 1 1 .908-.418A4 4 0 1 0 8 4V1.5a.5.5 0 0 1 1 0v3A.5.5 0 0 1 8.5 5H5a.5.5 0 0 1 0-1h2.5V3.5a.5.5 0 0 1 1 0V5A.5.5 0 0 1 8.5 6H5a.5.5 0 0 1 0-1h2.5V3.5A.5.5 0 0 1 8 3z"/>
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {/* AI is typing bubble ("..."), only if not animating reply */}
                {isTyping && pendingAI && pendingAI.thinking && (
                  <div className="flex items-start space-x-3">
                    <img
                      src={activeCharacter.image}
                      alt={activeCharacter.name}
                      className="w-12 h-12 rounded-full object-cover mr-2 border border-purple-600 bg-gray-900 flex-shrink-0"
                    />
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
                  <div className="flex items-start space-x-3" ref={aiTypewriterRef}>
                    <img
                      src={activeCharacter.image}
                      alt={activeCharacter.name}
                      className="w-12 h-12 rounded-full object-cover mr-2 border border-purple-600 bg-gray-900 flex-shrink-0"
                    />
                    <div className="bg-gray-700 p-3 rounded-lg max-w-md flex items-center">
                      <span className="typewriter">{pendingAI.text}</span>
                    </div>
                  </div>
                )}
                {/* Always keep this at the bottom for auto-scroll */}
                <div ref={messagesEndRef} />
              </div>
              {/* Message Input */}
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(activeCharacter?.id, e); }} className="flex space-x-2 mt-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-4 py-4 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-base min-h-[3rem]"
                  disabled={!activeCharacter || isTyping}
                  style={{ minHeight: '3rem' }}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || !activeCharacter || isTyping}
                  className={`px-6 py-2 rounded-lg transition-colors text-base font-semibold ${
                    isTyping || !inputMessage.trim() || !activeCharacter
                      ? "bg-gray-800 cursor-not-allowed text-gray-400"
                      : "bg-pink-500 hover:bg-pink-600 text-white"
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
};

import PropTypes from 'prop-types';

Chat.propTypes = {
  user: PropTypes.object,
  activeCharacter: PropTypes.object,
  setActiveCharacter: PropTypes.func,
  messages: PropTypes.array,
  inputMessage: PropTypes.string,
  setInputMessage: PropTypes.func,
  handleSendMessage: PropTypes.func,
  isTyping: PropTypes.bool,
  pendingAI: PropTypes.object,
  chatSessions: PropTypes.array,
  allCharacters: PropTypes.array,
  onRegenerate: PropTypes.func,
  onEditMessage: PropTypes.func,
};

export default Chat;
