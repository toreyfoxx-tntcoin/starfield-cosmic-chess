import React, { useState, useRef, useEffect } from 'react';
import { TutorialSection1 } from './tutorial/TutorialSection1';
import { TutorialSection2 } from './tutorial/TutorialSection2';
import { TutorialSection3 } from './tutorial/TutorialSection3';
import { TutorialSection4 } from './tutorial/TutorialSection4';
import { BookOpen, Target, Sparkles, Trophy, CheckCircle } from 'lucide-react';

interface TutorialScreenProps {
  onBack: () => void;
}

const SECTIONS = [
  { id: 1, title: 'FIDE Chess Rules', icon: BookOpen },
  { id: 2, title: 'Chess Strategy', icon: Target },
  { id: 3, title: 'Cosmic Abilities', icon: Sparkles },
  { id: 4, title: 'Progression & More', icon: Trophy },
  { id: 5, title: 'Conclusion', icon: CheckCircle },
];

export const TutorialScreen: React.FC<TutorialScreenProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState(1);
  const scrollRef = useRef<Record<number, number>>({});
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSectionChange = (id: number) => {
    if (contentRef.current) scrollRef.current[activeSection] = contentRef.current.scrollTop;
    setActiveSection(id);
  };

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = scrollRef.current[activeSection] || 0;
  }, [activeSection]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="bg-gradient-to-r from-purple-900/60 to-cyan-900/60 border-b border-cyan-500/30 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">← Back</button>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Starfield Tutorial</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-6xl mx-auto w-full">
        <nav className="md:w-64 bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-700/50 p-4 overflow-x-auto md:overflow-x-visible">
          <div className="flex md:flex-col gap-2 min-w-max md:min-w-0">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => handleSectionChange(s.id)} className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all text-left whitespace-nowrap ${activeSection === s.id ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white' : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300'}`}>
                <s.icon size={18} />
                <span className="text-sm font-medium">{s.title}</span>
              </button>
            ))}
          </div>
        </nav>

        <main ref={contentRef} className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="max-w-3xl">
            {activeSection === 1 && <TutorialSection1 />}
            {activeSection === 2 && <TutorialSection2 />}
            {activeSection === 3 && <TutorialSection3 />}
            {activeSection === 4 && <TutorialSection4 />}
            {activeSection === 5 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-cyan-300">Master Both Worlds</h3>
                <p className="text-slate-300 text-lg leading-relaxed">Cosmic abilities enhance but never replace sound chess fundamentals. The best Starfield players master classical strategy first, then learn to weave cosmic powers into their gameplay at critical moments.</p>
                <p className="text-slate-300 leading-relaxed">Practice both aspects: study openings, tactics, and endgames while experimenting with ability timing. The stars await your command!</p>
                <button onClick={onBack} className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg font-semibold hover:from-cyan-500 hover:to-purple-500 transition-all">Start Playing</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
