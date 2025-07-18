import axios from './axios';

// Character data synchronization service
class CharacterSyncService {
  constructor() {
    this.storageKey = 'userCharacters';
    this.syncInterval = null;
    this.syncInProgress = false;
  }

  // Get characters from localStorage
  getLocalCharacters() {
    try {
      const storedChars = localStorage.getItem(this.storageKey);
      const chars = storedChars ? JSON.parse(storedChars) : [];
      console.log('Retrieved', chars.length, 'characters from localStorage');
      return chars;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  // Get characters from localStorage - used externally
  getCharactersFromStorage() {
    return this.getLocalCharacters();
  }

  // Save characters to localStorage
  saveLocalCharacters(characters) {
    try {
      // Validate the characters array to avoid storage corruption
      if (!Array.isArray(characters)) {
        console.error('Attempted to save non-array to localStorage:', characters);
        return false;
      }
      
      console.log('Saving', characters.length, 'characters to localStorage');
      localStorage.setItem(this.storageKey, JSON.stringify(characters));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  // Add a character to local storage
  addLocalCharacter(character) {
    const characters = this.getLocalCharacters();
    characters.push(character);
    return this.saveLocalCharacters(characters);
  }

  // Update a character in local storage
  updateLocalCharacter(updatedCharacter) {
    const characters = this.getLocalCharacters();
    const index = characters.findIndex(c => c.id === updatedCharacter.id);
    if (index !== -1) {
      characters[index] = updatedCharacter;
      return this.saveLocalCharacters(characters);
    }
    return false;
  }

  // Remove a character from local storage
  removeLocalCharacter(characterId) {
    const characters = this.getLocalCharacters();
    const filtered = characters.filter(c => c.id !== characterId);
    return this.saveLocalCharacters(filtered);
  }

  // Load characters from API for a user
  async fetchUserCharacters(userId, force = false) {
    if (!userId) return { success: false, error: 'No user ID provided' };
    
    try {
      // Always fetch fresh data from server if force is true
      if (force) {
        console.log('Force refreshing characters from server for user:', userId);
        // Clear cache timestamp to ensure we don't use cached data
        localStorage.removeItem('lastCharacterFetch');
      } else {
        // Check if we've fetched recently (within last 60 seconds)
        const lastFetch = localStorage.getItem('lastCharacterFetch');
        if (lastFetch && Date.now() - parseInt(lastFetch) < 60000) {
          console.log('Using cached characters (fetched within last minute)');
          const characters = this.getLocalCharacters();
          return { success: true, characters, message: 'Characters loaded from cache' };
        }
      }
      
      // Add a cache-busting parameter when force=true
      const cacheBuster = force ? `?_cb=${Date.now()}` : '';
      console.log('Fetching characters from server for user:', userId);
      const response = await axios.get(`/api/characters/user/${userId}${cacheBuster}`);
      
      // Save fetch timestamp
      localStorage.setItem('lastCharacterFetch', Date.now().toString());
      
      // Handle different response formats
      let serverCharacters = [];
      
      if (response.data) {
        // Handle case where response.data might be the array directly
        if (Array.isArray(response.data)) {
          serverCharacters = response.data;
          console.log('Received array response with', serverCharacters.length, 'characters');
        } 
        // Handle case where response.data.characters might be the array
        else if (response.data.characters && Array.isArray(response.data.characters)) {
          serverCharacters = response.data.characters;
          console.log('Received nested characters array with', serverCharacters.length, 'characters');
        }
        // Handle case where response.data might be an object with different structure
        else if (typeof response.data === 'object') {
          // Try to extract any array from the response
          const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            serverCharacters = possibleArrays[0];
            console.log('Extracted array from response with', serverCharacters.length, 'characters');
          } else {
            console.warn('No character arrays found in response:', response.data);
          }
        }
      }
      
      // Map server's imageUrl to client's image field
      serverCharacters = serverCharacters.map(char => ({
        ...char,
        image: char.imageUrl || char.image || null
      }));
      console.log('Mapped image fields for', serverCharacters.length, 'characters');
      
      // Merge with any locally created characters
      const localChars = this.getLocalCharacters();
      
      console.log('Existing local characters:', localChars.length);
      
      // Keep only local characters with high IDs (temporary IDs not yet synced to server)
      // Typically these have ID values > 1000000
      const localIdsToKeep = localChars
        .filter(c => typeof c.id === 'number' && c.id > 1000000)
        .map(c => c.id);
      
      console.log('Local IDs to keep:', localIdsToKeep);
      
      // Keep locally created characters that haven't been synced
      const localOnlyChars = localChars.filter(c => localIdsToKeep.includes(c.id));
      
      console.log('Local-only characters to preserve:', localOnlyChars.length);
      console.log('Server characters to add:', serverCharacters.length);
      
      // Combine server characters with local-only characters
      const combinedChars = [...serverCharacters, ...localOnlyChars];
      
      // Clear any previous storage and save the combined list
      this.saveLocalCharacters(combinedChars);
      
      console.log('Total characters after merge:', combinedChars.length);
      
      return { 
        success: true, 
        characters: combinedChars,
        message: 'Characters loaded successfully'
      };
    } catch (error) {
      console.error('Error fetching characters:', error);
      
      // Provide more detailed error information
      let errorMessage = 'Unknown error occurred';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Server error: ${error.response.status}`;
        if (error.response.data && error.response.data.error) {
          errorMessage += ` - ${error.response.data.error}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'Error in request setup';
      }
      
      // If API fails, return local characters if available
      const localChars = this.getLocalCharacters();
      if (localChars.length > 0) {
        return { 
          success: true, 
          characters: localChars,
          message: 'Using locally stored characters (offline)',
          warning: errorMessage
        };
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  // Sync all unsaved characters to the server
  async syncToServer(userId, force = false) {
    if (!userId) return { success: false, error: 'No user ID provided' };
    if (this.syncInProgress && !force) return { success: false, error: 'Sync already in progress' };
    
    this.syncInProgress = true;
    
    try {
      const localChars = this.getLocalCharacters();
      const unsyncedChars = localChars.filter(char => 
        typeof char.id === 'number' && char.id > 1000000);
      
      if (unsyncedChars.length === 0) {
        this.syncInProgress = false;
        return { success: true, message: 'No characters to sync', characters: localChars };
      }
      
      // Process each unsynced character
      const results = await Promise.all(unsyncedChars.map(async (char) => {
        try {
          // Prepare payload for API
          const payload = {
            userId,
            name: char.name,
            description: char.description,
            imageUrl: char.image || null,
            backstory: char.backstory || '',
            personality: char.personality || '',
            motivations: char.motivations || '',
            values: char.values || '',
            accent: char.accent || '',
            scenario: char.scenario || '',
            isPublic: !!char.isPublic,
            nsfw: !!char.nsfw,
            firstMessage: char.firstMessage || '',
            tags: Array.isArray(char.tags) ? char.tags : [],
          };
          
          // Create new character on server
          const response = await axios.post('/api/characters', payload);
          
          // Handle different response formats
          if (response.data) {
            // Case where id is directly in the response
            if (response.data.id) {
              return {
                success: true,
                oldId: char.id,
                newId: response.data.id,
                character: response.data
              };
            }
            // Case where character object might be nested
            else if (response.data.character && response.data.character.id) {
              return {
                success: true,
                oldId: char.id,
                newId: response.data.character.id,
                character: response.data.character
              };
            }
          }
          
          console.warn('Unexpected server response format:', response.data);
          return { success: false, error: 'Unexpected server response format', character: char };
        } catch (error) {
          console.error('Error syncing character:', error);
          
          // Provide more detailed error information
          let errorMessage = 'Unknown sync error';
          
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            errorMessage = `Server error: ${error.response.status}`;
            if (error.response.data && error.response.data.error) {
              errorMessage += ` - ${error.response.data.error}`;
            }
          } else if (error.request) {
            // The request was made but no response was received
            errorMessage = 'No response from server. Please check your connection.';
          } else {
            // Something happened in setting up the request that triggered an Error
            errorMessage = error.message || 'Error in request setup';
          }
          
          return { 
            success: false, 
            error: errorMessage, 
            character: char 
          };
        }
      }));
      
      // Update local storage with synced characters
      const updatedChars = [...localChars];
      
      results.forEach(result => {
        if (result.success) {
          // Replace temp ID with server ID
          const index = updatedChars.findIndex(c => c.id === result.oldId);
          if (index !== -1) {
            updatedChars[index] = { 
              ...updatedChars[index], 
              id: result.newId 
            };
          }
        }
      });
      
      this.saveLocalCharacters(updatedChars);
      
      const syncedCount = results.filter(r => r.success).length;
      
      this.syncInProgress = false;
      return { 
        success: true, 
        syncedCount,
        failedCount: results.length - syncedCount,
        characters: updatedChars,
        message: `Synced ${syncedCount} of ${results.length} characters`
      };
    } catch (error) {
      console.error('Error during sync:', error);
      this.syncInProgress = false;
      
      // Provide more detailed error information
      let errorMessage = 'Unknown sync error occurred';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Server error: ${error.response.status}`;
        if (error.response.data && error.response.data.error) {
          errorMessage += ` - ${error.response.data.error}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'Error in request setup';
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  // Start automatic background sync
  startAutoSync(userId, intervalMs = 300000) { // Default: 5 minutes
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      if (userId) {
        this.syncToServer(userId).then(result => {
          if (result.syncedCount > 0) {
            console.log(`Auto-sync completed: ${result.message}`);
          }
        });
      }
    }, intervalMs);
    
    // Also sync on page unload
    window.addEventListener('beforeunload', () => {
      if (userId) {
        // Just make sure all characters are in localStorage
        this.saveLocalCharacters(this.getLocalCharacters());
      }
    });
    
    return true;
  }

  // Stop automatic sync
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      return true;
    }
    return false;
  }

  // Delete a character (both locally and on server if possible)
  async deleteCharacter(characterId) {
    try {
      // First, remove from local storage
      this.removeLocalCharacter(characterId);
      
      // If the ID is a server ID (not a temporary one), delete from server
      if (characterId && typeof characterId === 'number' && characterId < 1000000) {
        try {
          // Attempt to delete from server
          await axios.delete(`/api/characters/${characterId}`);
          console.log('Character deleted from server successfully:', characterId);
          return { success: true, message: 'Character deleted successfully' };
        } catch (error) {
          console.error('Error deleting character from server:', error);
          // Return error details for debugging
          return { 
            success: false, 
            message: 'Character deleted locally, but server deletion failed',
            error: error.response?.data?.error || error.message,
            status: error.response?.status
          };
        }
      }
      
      return { success: true, message: 'Character deleted successfully' };
    } catch (error) {
      console.error('Error deleting character:', error);
      return { success: false, error: error.message || 'Failed to delete character' };
    }
  }

  // Update a character (both locally and on server if possible)
  async updateCharacter(updatedCharacter) {
    try {
      // First, update in local storage
      this.updateLocalCharacter(updatedCharacter);
      
      // If the ID is a server ID (not a temporary one), update on server
      if (updatedCharacter.id && typeof updatedCharacter.id === 'number' && updatedCharacter.id < 1000000) {
        try {
          // Prepare payload for API
          const payload = {
            name: updatedCharacter.name,
            description: updatedCharacter.description,
            imageUrl: updatedCharacter.image || null,
            backstory: updatedCharacter.backstory || '',
            personality: updatedCharacter.personality || '',
            motivations: updatedCharacter.motivations || '',
            values: updatedCharacter.values || '',
            accent: updatedCharacter.accent || '',
            scenario: updatedCharacter.scenario || '',
            isPublic: !!updatedCharacter.isPublic,
            nsfw: !!updatedCharacter.nsfw,
            firstMessage: updatedCharacter.firstMessage || '',
            tags: Array.isArray(updatedCharacter.tags) ? updatedCharacter.tags : [],
          };
          
          // Update character on server
          await axios.put(`/api/characters/${updatedCharacter.id}`, payload);
          console.log('Character updated on server successfully:', updatedCharacter.id);
          return { success: true, message: 'Character updated successfully' };
        } catch (error) {
          console.error('Error updating character on server:', error);
          // Return error details for debugging
          return { 
            success: false, 
            message: 'Character updated locally, but server update failed',
            error: error.response?.data?.error || error.message,
            status: error.response?.status
          };
        }
      }
      
      return { success: true, message: 'Character updated successfully' };
    } catch (error) {
      console.error('Error updating character:', error);
      return { success: false, error: error.message || 'Failed to update character' };
    }
  }
}

// Export a singleton instance
export default new CharacterSyncService();
