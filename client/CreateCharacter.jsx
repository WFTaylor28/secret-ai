import React from "react";

const CreateCharacter = ({
  newCharacter,
  handleInputChange,
  handleImageChange,
  handleSubmit,
}) => (
  <section>
    <h2 className="text-3xl font-bold mb-6">Create New Character</h2>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Character Name <span className="text-red-500">*</span>
        </label>
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
        <label className="block text-sm font-medium mb-1">
          Character Image <span className="text-red-500">*</span>
        </label>
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
        <label className="block text-sm font-medium mb-1">Backstory</label>
        <textarea
          name="backstory"
          value={newCharacter.backstory || ""}
          onChange={handleInputChange}
          rows={2}
          className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Describe your character's backstory..."
        ></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Personality Traits</label>
        <input
          type="text"
          name="personality"
          value={newCharacter.personality || ""}
          onChange={handleInputChange}
          className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="e.g. sarcastic, kind, brave, funny, shy, youthful, etc. (comma separated)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Motivations</label>
        <input
          type="text"
          name="motivations"
          value={newCharacter.motivations || ""}
          onChange={handleInputChange}
          className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="What drives your character? (comma separated)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Values</label>
        <input
          type="text"
          name="values"
          value={newCharacter.values || ""}
          onChange={handleInputChange}
          className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="What does your character value? (comma separated)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Accent / Dialect</label>
        <select
          name="accent"
          value={newCharacter.accent || ""}
          onChange={handleInputChange}
          className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">None</option>
          <option value="british">British</option>
          <option value="southern">Southern US</option>
          <option value="pirate">Pirate</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={newCharacter.description}
          onChange={handleInputChange}
          rows={2}
          className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Describe your character's appearance, quirks, or style..."
        ></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Current Scenario <span className="text-red-500">*</span>
        </label>
        <textarea
          name="scenario"
          value={newCharacter.scenario || ""}
          onChange={handleInputChange}
          rows={2}
          required
          className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Describe the current circumstances or context for this character's story..."
        ></textarea>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          First Message (what the AI says to start the chat) <span className="text-red-500">*</span>
        </label>
        <textarea
          name="firstMessage"
          value={newCharacter.firstMessage || ""}
          onChange={handleInputChange}
          rows={4}
          required
          className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder={
            `Example:\n**The character paces the room, glancing at the door.**\n_What if they never arrive?_\n\n"You're finally here! I was starting to think you'd forgotten about me."\n\n**She grins, folding her arms.**\n\n(Write the AI's first message in this immersive, expressive style. Use double asterisks for actions, _italics_ for thoughts, and quotes for speech. Alternate between actions and speech, and include at least three actions and one internal thought.)`
          }
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
  </section>
);

export default CreateCharacter;
