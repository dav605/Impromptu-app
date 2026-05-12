import { useState, useCallback, useRef, useEffect } from 'react';

export function useSpeechRecognition(aaiKey) {
  const [isRecording, setIsRecording] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);

  // Clean up WebSocket on unmount to prevent orphaned sessions during Hot Reloads
  useEffect(() => {
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'Terminate' }));
        wsRef.current.close();
      }
    };
  }, []);

  const stopRecording = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'Terminate' }));
      // Leave connection open to receive the final Turn from AssemblyAI.
      // AssemblyAI will close the socket itself. We just set a 5s fallback timeout.
      setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
      }, 5000);
    }
    
    if (processorRef.current) {
      processorRef.current.onaudioprocess = null;
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    
    setIsRecording(false);
    setIsStarting(false);
  }, []);

  const startRecording = useCallback(async () => {
    if (!aaiKey) {
      setError("AssemblyAI API Key is required.");
      return;
    }
    
    try {
      setIsStarting(true);
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      
      // Mint Token via CORS proxy
      const targetUrl = 'https://streaming.assemblyai.com/v3/token?expires_in_seconds=300';
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`, {
        headers: { authorization: aaiKey }
      });
      if (!res.ok) throw new Error("Failed to mint AssemblyAI token. Check your API Key.");
      const { token } = await res.json();
      
      // Connect WebSocket
      const ws = new WebSocket(`wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&speech_model=u3-rt-pro&token=${token}`);
      wsRef.current = ws;
      
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === 'Turn') {
          if (msg.end_of_turn) {
            setTranscript(prev => (prev ? prev + ' ' : '') + msg.transcript);
            setInterimTranscript('');
          } else {
            setInterimTranscript(msg.transcript);
          }
        } else if (msg.type === 'Error') {
          console.error("AssemblyAI WebSocket Error message:", msg.error);
          setError(msg.error);
          stopRecording();
        }
      };
      
      ws.onopen = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          
          setIsStarting(false);
          setIsRecording(true);
          
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          audioContextRef.current = audioContext;
          
          const source = audioContext.createMediaStreamSource(stream);
          const processor = audioContext.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;
          
          source.connect(processor);
          processor.connect(audioContext.destination);
          
          processor.onaudioprocess = (e) => {
            if (ws.readyState === WebSocket.OPEN) {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = downsampleAndConvertToPCM16(inputData, audioContext.sampleRate, 16000);
              ws.send(pcm16);
            }
          };
        } catch (mediaErr) {
          console.error("Mic access error:", mediaErr);
          setError("Microphone access denied or unavailable.");
          stopRecording();
        }
      };
      
      ws.onerror = (err) => {
        console.error("WebSocket error", err);
        setError("WebSocket connection failed. Verify your API Key and network.");
        stopRecording();
      };
      
      ws.onclose = () => {
        setIsRecording(false);
        setIsStarting(false);
        // Flush any remaining grey interim text to the final black transcript
        setInterimTranscript(prevInterim => {
          if (prevInterim) {
            setTranscript(prev => (prev ? prev + ' ' : '') + prevInterim);
          }
          return '';
        });
      };
      
    } catch (err) {
      console.error(err);
      setError(err.message);
      setIsStarting(false);
      setIsRecording(false);
    }
  }, [aaiKey, stopRecording]);

  return { isRecording, isStarting, transcript, interimTranscript, error, startRecording, stopRecording };
}

// Helper to downsample Float32 to 16kHz PCM16
function downsampleAndConvertToPCM16(buffer, sampleRate, outRate) {
  if (sampleRate === outRate) {
    const pcm16 = new Int16Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      let s = Math.max(-1, Math.min(1, buffer[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return pcm16.buffer;
  }
  
  const sampleRateRatio = sampleRate / outRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Int16Array(newLength);
  
  let offsetResult = 0;
  let offsetBuffer = 0;
  
  while (offsetResult < result.length) {
    let nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0, count = 0;
    
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    
    let sample = accum / count;
    let s = Math.max(-1, Math.min(1, sample));
    result[offsetResult] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  
  return result.buffer;
}
