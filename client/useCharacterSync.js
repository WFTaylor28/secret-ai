import { useState, useEffect } from 'react';
import characterSync from './characterSync';

/**
 * Custom hook for character synchronization
 * @param {Object} options Configuration options
 * @param {number} options.userId User ID for synchronization
 * @param {boolean} options.autoSync Whether to start auto-sync (default: true)
 * @returns {Object} Character sync methods and state
 */
function useCharacterSync({ userId, autoSync = true } = {}) {
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);

  // Load characters from local storage or API
  const loadCharacters = async () => {
    if (!userId) {
      // If no userId, just load from localStorage
      const localChars = characterSync.getCharactersFromStorage();
      setCharacters(localChars);
      return;
    }
    
    setIsLoading(true);
    setSyncStatus({ type: 'info', message: 'Loading characters...' });
    
    try {
      console.log('Loading characters for user:', userId);
      const result = await characterSync.fetchUserCharacters(userId);
      
      if (result.success) {
        console.log('Characters loaded successfully:', result.characters.length);
        setCharacters(result.characters);
        setSyncStatus({ 
          type: 'success', 
          message: result.message || 'Characters loaded successfully' 
        });
      } else {
        console.error('Failed to load characters:', result.error);
        setError(result.error);
        setSyncStatus({ 
          type: 'error', 
          message: result.error || 'Failed to load characters' 
        });
      }
    } catch (err) {
      console.error('Error loading characters:', err);
      setError(err.message || 'Unknown error');
      setSyncStatus({ 
        type: 'error', 
        message: `Error loading characters: ${err.message || 'Unknown error'}`
      });
      
      // Try to load from localStorage if API fails
      const localChars = characterSync.getCharactersFromStorage();
      console.log('Falling back to local storage:', localChars.length, 'characters');
      if (localChars.length > 0) {
        setCharacters(localChars);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sync characters to server
  const syncToServer = async () => {
    if (!userId) return;
    
    setSyncStatus({ type: 'info', message: 'Syncing characters...' });
    
    try {
      console.log('Syncing characters to server for user:', userId);
      const result = await characterSync.syncToServer(userId);
      
      if (result.success) {
        console.log('Sync successful, updated characters:', result.characters?.length);
        if (result.characters) {
          setCharacters(result.characters);
        }
        setSyncStatus({ 
          type: 'success', 
          message: result.message || 'Characters synced successfully' 
        });
        return true;
      } else {
        console.error('Sync failed:', result.error);
        setSyncStatus({ 
          type: 'error', 
          message: result.error || 'Failed to sync characters' 
        });
        return false;
      }
    } catch (err) {
      console.error('Error during sync:', err);
      setError(err.message || 'Unknown error');
      setSyncStatus({ 
        type: 'error', 
        message: `Error syncing characters: ${err.message || 'Unknown error'}`
      });
      return false;
    }
  };

  // Add a new character (local and sync)
  const addCharacter = async (character) => {
    // Create a temporary ID for local storage
    const tempId = Date.now() + Math.floor(Math.random() * 1000);
    const newChar = { ...character, id: tempId };
    
    console.log('Adding new character with temp ID:', tempId);
    
    // Add to local storage
    characterSync.addLocalCharacter(newChar);
    
    // Update state
    setCharacters(prev => [...prev, newChar]);
    
    // Try to sync immediately if logged in
    if (userId) {
      console.log('Attempting immediate sync after character creation');
      syncToServer();
    }
    
    return newChar;
  };

  // Update an existing character
  const updateCharacter = async (updatedCharacter) => {
    // Update in local storage
    characterSync.updateLocalCharacter(updatedCharacter);
    
    // Update in state
    setCharacters(prev => 
      prev.map(c => c.id === updatedCharacter.id ? updatedCharacter : c)
    );
    
    // Try to sync immediately if logged in
    if (userId) {
      syncToServer();
    }
    
    return updatedCharacter;
  };

  // Delete a character
  const deleteCharacter = async (characterId) => {
    // Remove from local storage
    characterSync.removeLocalCharacter(characterId);
    
    // Remove from state
    setCharacters(prev => prev.filter(c => c.id !== characterId));
    
    // Try to sync immediately if logged in
    if (userId) {
      syncToServer();
    }
    
    return true;
  };

  // Start auto-sync when userId changes
  useEffect(() => {
    if (userId && autoSync) {
      // Load characters initially
      console.log('Initial character load for user:', userId);
      loadCharacters();
      
      // Start auto-sync for logged in users
      characterSync.startAutoSync(userId);
      
      // Cleanup on unmount or userId change
      return () => {
        console.log('Stopping auto-sync');
        characterSync.stopAutoSync();
      };
    } else if (!userId) {
      // Just load from localStorage if not logged in
      console.log('Not logged in, loading from localStorage only');
      const localChars = characterSync.getCharactersFromStorage();
      setCharacters(localChars);
    }
  }, [userId, autoSync]);

  return {
    characters,
    isLoading,
    error,
    syncStatus,
    loadCharacters,
    syncToServer,
    addCharacter,
    updateCharacter,
    deleteCharacter
  };
}

export default useCharacterSync;
