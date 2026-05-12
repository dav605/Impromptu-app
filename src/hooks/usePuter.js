import { useState, useEffect } from 'react';

/**
 * usePuter – optional integration with Puter for AssemblyAI API key storage.
 *
 * Features:
 *   • Lazily loads the Puter library only when needed.
 *   • Uses the AssemblyAI key from environment variables if available.
 *   • Exposes `signIn` for the UI to trigger Puter authentication.
 *   • After a successful sign‑in it fetches the key from Puter KV or prompts the user.
 */
export function usePuter() {
  const [aaiKey, setAaiKey] = useState(import.meta.env.VITE_ASSEMBLYAI_API_KEY || null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [puter, setPuter] = useState(null);

  // Load Puter dynamically (only once)
  const loadPuter = async () => {
    if (puter) return puter;
    try {
      const mod = await import('@heyputer/puter.js');
      setPuter(mod.puter);
      return mod.puter;
    } catch (_) {
      console.warn('Puter library not available – authentication disabled.');
      return null;
    }
  };

  // Helper to fetch key from Puter KV store
  const fetchKeyFromPuter = async (p) => {
    try {
      const stored = await p.kv.get('ASSEMBLYAI_API_KEY');
      return stored || null;
    } catch (e) {
      console.error('Failed to read AssemblyAI key from Puter KV:', e);
      return null;
    }
  };

  // Initialise on mount – try env key, otherwise check existing Puter sign‑in.
  useEffect(() => {
    const init = async () => {
      if (aaiKey) {
        setIsInitializing(false);
        return;
      }

      const envKey = import.meta.env.VITE_ASSEMBLYAI_API_KEY;
      if (envKey) {
        setAaiKey(envKey);
        setIsInitializing(false);
        return;
      }

      const p = await loadPuter();
      if (!p) {
        setIsInitializing(false);
        return;
      }

      try {
        const signedIn = await p.auth.isSignedIn();
        setIsSignedIn(signedIn);
        if (!signedIn) {
          setIsInitializing(false);
          return;
        }
        const key = await fetchKeyFromPuter(p);
        if (key) {
          setAaiKey(key);
        } else {
          const entered = prompt('Please enter your AssemblyAI API Key for live transcription:');
          if (entered) {
            await p.kv.set('ASSEMBLYAI_API_KEY', entered);
            setAaiKey(entered);
          } else {
            throw new Error('AssemblyAI API Key is required for live transcription.');
          }
        }
      } catch (e) {
        console.error('Puter init error:', e);
        setError(e.message);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exposed sign‑in function for UI components
  const signIn = async () => {
    const p = await loadPuter();
    if (!p) {
      setError('Puter library not loaded; cannot sign in.');
      return;
    }
    try {
      await p.auth.signIn();
      setIsSignedIn(true);
      const key = await fetchKeyFromPuter(p);
      if (key) {
        setAaiKey(key);
      } else {
        const entered = prompt('Please enter your AssemblyAI API Key for live transcription:');
        if (entered) {
          await p.kv.set('ASSEMBLYAI_API_KEY', entered);
          setAaiKey(entered);
        } else {
          throw new Error('AssemblyAI API Key is required for live transcription.');
        }
      }
    } catch (e) {
      console.error('Puter sign‑in failed:', e);
      setError(e.message);
    }
  };

  return { aaiKey, isInitializing, error, isSignedIn, signIn };
}
