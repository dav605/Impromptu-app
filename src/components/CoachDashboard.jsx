import { motion } from 'framer-motion';
import { Mic, Square, RefreshCw, Wand2 } from 'lucide-react';

export function CoachDashboard({ 
  practiceMode,
  setPracticeMode,
  practiceContext,
  setPracticeContext,
  currentPrompt, 
  generatePrompt,
  isGeneratingPrompt,
  isRecording, 
  isStarting,
  transcript, 
  interimTranscript, 
  startRecording, 
  stopRecording,
  isAnalyzing,
  handleAnalyze
}) {
  return (
    <div className="bg-[#12141a] rounded-3xl shadow-2xl border border-[#1f2229] p-8 relative overflow-hidden">
      {/* Decorative background blob */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-brand-primary opacity-5 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex flex-col mb-12 gap-6 items-center text-center">
          
          <div className="bg-[#181a20] p-1.5 rounded-2xl border border-white/5 inline-flex shadow-inner">
            {['Impromptu', 'Rehearsal', 'Interview'].map(mode => (
              <button
                key={mode}
                onClick={() => setPracticeMode(mode)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${practiceMode === mode ? 'bg-[#2a2d36] text-white shadow-sm border border-white/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                {mode}
              </button>
            ))}
          </div>

          {(practiceMode === 'Interview' || practiceMode === 'Rehearsal') && (
            <div className="w-full max-w-md">
              <input 
                type="text" 
                value={practiceContext}
                onChange={(e) => setPracticeContext(e.target.value)}
                placeholder={practiceMode === 'Interview' ? 'Job Role (e.g., Software Engineer)' : 'Topic or Scenario (e.g., Wedding Toast)'}
                className="w-full px-5 py-3 rounded-2xl bg-[#0b0c10] border border-[#2a2d36] text-white placeholder:text-slate-500 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all shadow-inner"
              />
            </div>
          )}
        </div>

        {/* Prompt Card */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="bg-[#12141a] rounded-2xl p-8 text-center relative flex flex-col items-center justify-center min-h-[160px] border border-[#1f2229] shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#181a20] px-4 py-1 rounded-full text-xs font-bold text-brand-primary border border-white/10 shadow-lg flex items-center gap-1">
              <Wand2 className="w-3 h-3" /> FEATURED
            </div>
            <p className="text-xl md:text-3xl font-bold text-white leading-relaxed tracking-tight mt-2">
              {currentPrompt || "Click below to begin"}
            </p>
            <div className="mt-8">
              <button 
                onClick={generatePrompt}
                disabled={isRecording || isAnalyzing || isGeneratingPrompt || ((practiceMode === 'Interview' || practiceMode === 'Rehearsal') && !practiceContext.trim())}
                className="flex items-center gap-2 bg-white text-[#0b0c10] hover:bg-slate-200 px-6 py-3 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 relative z-10"
              >
                <RefreshCw className={`w-4 h-4 ${isGeneratingPrompt ? 'animate-spin' : ''}`} />
                Generate Prompt
              </button>
            </div>
          </div>
        </div>

        {/* Recording Interface */}
        <div className="flex flex-col items-center">
          <div className="mb-12 relative flex items-center justify-center">
            {isRecording && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute w-32 h-32 bg-red-500 rounded-full"
              />
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isAnalyzing || !currentPrompt || isStarting}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl border-4 ${
                isRecording 
                  ? 'bg-red-500 border-red-400 text-white hover:bg-red-600 shadow-red-500/50' 
                  : isStarting
                  ? 'bg-[#181a20] border-[#2a2d36] text-white cursor-wait'
                  : 'bg-white border-white text-[#0b0c10] hover:bg-slate-200 hover:border-slate-200 shadow-white/20 disabled:bg-[#181a20] disabled:border-[#2a2d36] disabled:text-slate-500 disabled:cursor-not-allowed'
              }`}
            >
              {isRecording ? <Square className="w-10 h-10" fill="currentColor" /> : isStarting ? <RefreshCw className="w-10 h-10 animate-spin" /> : <Mic className="w-10 h-10" />}
            </button>
          </div>

          {/* Transcript View */}
          <div className="w-full bg-[#0b0c10] rounded-3xl p-8 border border-[#1f2229] min-h-[200px] shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1f2229] to-transparent"></div>
            <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></span>
              Live Transcript
            </h3>
            {transcript || interimTranscript ? (
              <p className="text-slate-200 text-xl leading-relaxed font-medium">
                {transcript}
                <span className="text-slate-500 ml-1">{interimTranscript}</span>
              </p>
            ) : (
              <p className="text-slate-600 italic text-lg">Your speech will appear here...</p>
            )}
          </div>
          
          {/* Analyze Button */}
          {transcript && !isRecording && !isAnalyzing && (
            <div className="mt-8">
              <button 
                onClick={handleAnalyze}
                className="bg-brand-primary hover:bg-brand-dark text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <Wand2 className="w-5 h-5" />
                Analyze Speech
              </button>
            </div>
          )}

          {isAnalyzing && (
            <div className="mt-8 flex items-center gap-3 text-brand-primary font-bold text-lg">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <RefreshCw className="w-6 h-6" />
              </motion.div>
              Analyzing with AI...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
