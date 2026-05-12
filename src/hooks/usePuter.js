import { useState, useEffect } from 'react';
// import { puter } from '@heyputer/puter.js'; // Puter not needed

export function usePuter() {
  const [aaiKey, setAaiKey] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initializePuter() {
      try {
        // If Puter is not configured, we'll rely on the AssemblyAI key from .env
        if (!puter) {
          console.warn('Puter not configured; using AssemblyAI key from env only.');
        }

        // Try to get AssemblyAI API key from env, then KV store
        let key = import.meta.env.VITE_ASSEMBLYAI_API_KEY;
        if (!key && puter) {
          key = await puter.kv.get("ASSEMBLYAI_API_KEY");
        }
        
        if (!key) {
          // If not found, prompt the user
          key = prompt("Please enter your AssemblyAI API Key for live transcription:");
          if (key) {
            await puter.kv.set("ASSEMBLYAI_API_KEY", key);
          } else {
            throw new Error("AssemblyAI API Key is required for live transcription.");
          }
        }
        
        setAaiKey(key);
      } catch (err) {
        console.error("Error initializing Puter:", err);
        setError(err.message);
      } finally {
        setIsInitializing(false);
      }
    }
    
    initializePuter();
  }, []);

  return { aaiKey, isInitializing, error };
}
