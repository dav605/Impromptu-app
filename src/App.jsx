import { useState, useEffect } from 'react';
import { Activity, Mic, RefreshCw } from 'lucide-react';
import { CoachDashboard } from './components/CoachDashboard';
import { FeedbackResults } from './components/FeedbackResults';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { puter } from '@heyputer/puter.js';
import { usePuter } from './hooks/usePuter';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { GeminiService } from './services/GeminiService';
import ElectricBorder from './components/ElectricBorder';
import { supabase } from './lib/supabase';
import reactLogo from './assets/react.png';

function App() {
  const { aaiKey, isInitializing, error: puterError } = usePuter();
  const { isRecording, isStarting, transcript, interimTranscript, startRecording, stopRecording, error: speechError } = useSpeechRecognition(aaiKey);
  
  const [currentTab, setCurrentTab] = useState('Home');
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [practiceMode, setPracticeMode] = useState('Impromptu');
  const [practiceContext, setPracticeContext] = useState("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleGeneratePrompt();
  }, []);

  const handleGeneratePrompt = async () => {
    setIsGeneratingPrompt(true);
    setAnalysisResults(null);
    setError(null);
    try {
      let promptText = "";
      if (practiceMode === 'Impromptu') {
        promptText = "Return EXACTLY ONE short sentence containing a random impromptu speech topic (e.g. 'Persuade the audience that hot dogs are a type of sandwich'). Do NOT write a speech, do NOT include explanations, just return the topic itself.";
      } else if (practiceMode === 'Interview') {
        promptText = `Return EXACTLY ONE challenging interview question for a ${practiceContext} position. Do NOT provide an answer or explanations, just the question.`;
      } else if (practiceMode === 'Rehearsal') {
        promptText = `Return EXACTLY ONE short sentence describing a scenario for a public speaking rehearsal about: ${practiceContext}. Do NOT write the speech itself.`;
      }
      
      const puterRes = await puter.ai.chat(promptText, { model: 'gpt-4o-mini' });
      if (puterRes && puterRes.error) throw new Error(puterRes.error || puterRes.message);
      
      const responseText = typeof puterRes === 'string' ? puterRes : puterRes.toString();
      setCurrentPrompt(responseText.trim().replace(/^["']|["']$/g, ''));
    } catch (err) {
      console.error(err);
      setError(`Failed to generate prompt: ${err.message || 'Unknown error. Check console.'}`);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const saveAnalysis = async (transcript, analysis) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .insert([
          { prompt: currentPrompt, transcript, analysis }
        ]);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to save to Supabase:", err);
      // Don't throw, just log it so the user still sees their results
    }
  };

  const handleAnalyze = async () => {
    if (!transcript) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const gemini = new GeminiService();
      const analysis = await gemini.analyzeSpeech(currentPrompt, transcript);
      setAnalysisResults(analysis);
      
      await saveAnalysis(transcript, analysis);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#12141a]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={reactLogo} 
              alt="Softskills Logo" 
              className="w-12 h-12 object-contain mix-blend-screen brightness-125 drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
              Softskills
            </span>
          </div>

          <nav className="flex items-center gap-1 bg-[#181a20] p-1 rounded-2xl border border-white/5 shadow-inner">
            {['Home', 'Practice', 'Analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  currentTab === tab 
                    ? 'bg-[#2a2d36] text-white shadow-sm border border-white/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        
        {puterError || speechError || error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 flex items-center gap-3 shadow-lg shadow-red-500/5">
            <div className="bg-red-500/20 p-1.5 rounded-full"><Activity className="w-4 h-4 text-red-400" /></div>
            <p className="font-medium text-sm">{puterError || speechError || error}</p>
          </div>
        ) : null}

        {currentTab === 'Home' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#181a20] border border-[#2a2d36] text-slate-300 font-semibold text-sm mb-4 shadow-lg shadow-brand-primary/5">
              <Activity className="w-4 h-4 text-brand-primary" /> AI-Powered Coaching
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Master the art of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-400 drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]">
                Impromptu Speaking
              </span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
              Get real-time feedback on your speech structure, filler words, and confidence. Practice anytime, anywhere with live AI analysis.
            </p>
            <button 
              onClick={() => setCurrentTab('Practice')}
              className="bg-white text-black hover:bg-slate-200 px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] mt-4"
            >
              Start Practicing Now
            </button>
          </div>
        )}

        {currentTab === 'Practice' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {isInitializing ? (
               <div className="flex items-center justify-center min-h-[400px]">
                 <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
               </div>
            ) : (
               <ElectricBorder
                 color="#0ea5e9"
                 speed={1}
                 chaos={0.12}
                 borderRadius={24}
                 className="w-full"
               >
                 <CoachDashboard 
                   practiceMode={practiceMode}
                   setPracticeMode={setPracticeMode}
                   practiceContext={practiceContext}
                   setPracticeContext={setPracticeContext}
                   currentPrompt={currentPrompt}
                   generatePrompt={handleGeneratePrompt}
                   isGeneratingPrompt={isGeneratingPrompt}
                   isRecording={isRecording}
                   isStarting={isStarting}
                   transcript={transcript}
                   interimTranscript={interimTranscript}
                   startRecording={startRecording}
                   stopRecording={stopRecording}
                   isAnalyzing={isAnalyzing}
                   handleAnalyze={handleAnalyze}
                 />
               </ElectricBorder>
            )}
            {analysisResults && <FeedbackResults results={analysisResults} />}
          </div>
        )}

        {currentTab === 'Analytics' && <AnalyticsDashboard />}
        
      </main>
    </div>
  );
}

export default App;
