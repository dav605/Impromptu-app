import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle2, AlertTriangle, TrendingUp, Clock, FileText } from 'lucide-react';

export function FeedbackResults({ results, hideScore = false }) {
  if (!results || !results.metrics) return null;

  const { metrics, feedback } = results;
  
  const scoreData = [
    { name: 'Score', value: metrics.confidenceScore },
    { name: 'Remaining', value: 100 - metrics.confidenceScore }
  ];
  
  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // emerald
    if (score >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };
  
  const scoreColor = getScoreColor(metrics.confidenceScore);

  return (
    <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {!hideScore && (
        <div className="md:col-span-1 bg-[#12141a] rounded-3xl p-6 border border-[#1f2229] shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0b0c10]/50 pointer-events-none"></div>
          <h3 className="text-lg font-bold text-slate-300 mb-2 relative z-10">Confidence Score</h3>
          <div className="w-48 h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={scoreColor} />
                  <Cell fill="#1f2229" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-5xl font-black text-white">{metrics.confidenceScore}</span>
              <span className="text-sm text-slate-500 font-semibold uppercase tracking-wider">/ 100</span>
            </div>
          </div>
        </div>
      )}

      <div className={`${hideScore ? 'md:col-span-3' : 'md:col-span-2'} grid grid-cols-2 gap-4`}>
        <MetricCard 
          icon={<Clock className="w-5 h-5 text-brand-primary" />}
          title="Speaking Pace"
          value={metrics.wordsPerMinute}
          subtitle="words per minute"
          color="border-brand-primary/20 bg-brand-primary/5"
        />
        <MetricCard 
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          title="Filler Words"
          value={metrics.fillerWordCount}
          subtitle="ums, ahs, likes"
          color="border-amber-500/20 bg-amber-500/5"
        />
      </div>

      <div className="md:col-span-3 grid md:grid-cols-2 gap-6 mt-2">
        <FeedbackPanel 
          title="What you did well" 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          items={feedback.strengths}
          borderColor="border-emerald-500/20"
          bgColor="bg-emerald-500/5"
        />
        <FeedbackPanel 
          title="Areas to improve" 
          icon={<TrendingUp className="w-5 h-5 text-brand-primary" />}
          items={feedback.weaknesses}
          borderColor="border-brand-primary/20"
          bgColor="bg-brand-primary/5"
        />
      </div>

      <div className="md:col-span-3 bg-[#12141a] rounded-3xl p-8 border border-[#1f2229] shadow-xl mt-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none"></div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-400" />
          Detailed Evaluation
        </h3>
        <p className="text-slate-300 leading-relaxed text-lg">{feedback.detailedFeedback}</p>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle, color }) {
  return (
    <div className={`rounded-3xl p-6 border border-[#1f2229] bg-[#12141a] flex flex-col justify-center shadow-lg`}>
      <div className="flex items-center gap-2 text-slate-400 font-semibold mb-3">
        {icon}
        <span className="text-sm uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black text-white">{value}</span>
        <span className="text-slate-500 font-medium">{subtitle}</span>
      </div>
    </div>
  );
}

function FeedbackPanel({ title, icon, items, borderColor, bgColor }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={`rounded-3xl p-8 border ${borderColor} ${bgColor} bg-[#12141a] shadow-lg relative overflow-hidden`}>
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-[#0b0c10] rounded-xl border border-white/5 shadow-inner">{icon}</div>
        {title}
      </h3>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <motion.li 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="flex gap-3 text-slate-300"
          >
            <span className="text-brand-primary font-bold mt-0.5">•</span>
            <span className="leading-relaxed">{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
