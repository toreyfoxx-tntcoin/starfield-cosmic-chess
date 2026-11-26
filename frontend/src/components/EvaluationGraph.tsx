import { useMemo } from 'react';

interface EvaluationGraphProps {
  evaluations: { ply: number; eval: number }[];
  currentPly: number;
  onSeek?: (ply: number) => void;
}

export function EvaluationGraph({ evaluations, currentPly, onSeek }: EvaluationGraphProps) {
  const { points, minEval, maxEval } = useMemo(() => {
    if (evaluations.length === 0) return { points: '', minEval: -5, maxEval: 5 };
    
    const min = Math.max(-10, Math.min(...evaluations.map(e => e.eval)));
    const max = Math.min(10, Math.max(...evaluations.map(e => e.eval)));
    const range = max - min || 1;
    
    const width = 600;
    const height = 150;
    const padding = 20;
    
    const pts = evaluations.map((e, i) => {
      const x = padding + (i / (evaluations.length - 1 || 1)) * (width - 2 * padding);
      const y = padding + ((max - e.eval) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');
    
    return { points: pts, minEval: min, maxEval: max };
  }, [evaluations]);

  const currentX = useMemo(() => {
    if (evaluations.length === 0) return 0;
    return 20 + (currentPly / (evaluations.length - 1 || 1)) * 560;
  }, [currentPly, evaluations.length]);

  return (
    <div className="bg-slate-900/90 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
      <h3 className="text-sm font-semibold mb-2 text-slate-200">Position Evaluation</h3>
      <svg viewBox="0 0 600 150" className="w-full h-32 cursor-pointer">
        <line x1="20" y1="75" x2="580" y2="75" stroke="#475569" strokeWidth="1" strokeDasharray="4" />
        <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" />
        <line x1={currentX} y1="20" x2={currentX} y2="130" stroke="#f59e0b" strokeWidth="2" />
        <text x="10" y="25" className="text-xs fill-slate-400">+{maxEval.toFixed(1)}</text>
        <text x="10" y="80" className="text-xs fill-slate-400">0.0</text>
        <text x="10" y="135" className="text-xs fill-slate-400">{minEval.toFixed(1)}</text>
      </svg>
      <div className="flex justify-between text-xs text-slate-400 mt-2">
        <span>White Advantage</span>
        <span>Black Advantage</span>
      </div>
    </div>
  );
}
