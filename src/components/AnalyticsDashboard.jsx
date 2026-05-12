import { useState, useEffect } from 'react';
import { FeedbackResults } from './FeedbackResults';
import { supabase } from '../lib/supabase';

export function AnalyticsDashboard() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSessions(data || []);
      } catch (err) {
        console.error("Failed to load sessions:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSessions();
  }, []);

  if (isLoading) {
    return <div className="text-center py-12 text-slate-400">Loading your history...</div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-20 bg-[#12141a] rounded-3xl border border-[#1f2229]">
        <h3 className="text-2xl font-bold text-slate-300 mb-2">No practice history yet</h3>
        <p className="text-slate-500">Record a speech in the Practice tab to see your analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Your Progress</h2>
        <p className="text-slate-400">Review past speeches and track your improvement.</p>
      </div>

      <div className="grid gap-6">
        {sessions.map((session) => (
          <div key={session.id} className="bg-[#12141a] border border-[#1f2229] rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-white/5 pb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {session.prompt}
                </h3>
                <span className="text-sm text-slate-500 bg-[#181a20] px-3 py-1 rounded-full border border-white/5">
                  {new Date(session.created_at).toLocaleString()}
                </span>
              </div>
              <div className="bg-[#0b0c10] border border-[#2a2d36] px-6 py-3 rounded-2xl text-center shadow-inner">
                <div className="text-sm text-slate-400 font-semibold mb-1 uppercase tracking-wider">Score</div>
                <div className="text-3xl font-black text-brand-primary">{session.analysis?.metrics?.confidenceScore || 0}<span className="text-lg text-slate-600">/100</span></div>
              </div>
            </div>
            
            {session.analysis && <FeedbackResults results={session.analysis} hideScore />}
          </div>
        ))}
      </div>
    </div>
  );
}
