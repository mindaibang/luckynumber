
import React, { useState, useEffect, useRef } from 'react';
import { performDraw } from './services/geminiService';
import { DrawConfig, HistoryItem } from './types';
import HistoryChart from './components/HistoryChart';

const App: React.FC = () => {
  const [config, setConfig] = useState<DrawConfig>({ min: 1, max: 99, count: 1 });
  const [lockedNumbers, setLockedNumbers] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Animation states
  const [currentBallIndex, setCurrentBallIndex] = useState<number | null>(null);
  const [rollingValue, setRollingValue] = useState<number | null>(null);
  const [currentBatchResults, setCurrentBatchResults] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const rollingInterval = useRef<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const startRolling = (min: number, max: number) => {
    if (rollingInterval.current) clearInterval(rollingInterval.current);
    rollingInterval.current = window.setInterval(() => {
      const rand = Math.floor(Math.random() * (max - min + 1)) + min;
      setRollingValue(rand);
    }, 60);
  };

  const stopRolling = () => {
    if (rollingInterval.current) {
      clearInterval(rollingInterval.current);
      rollingInterval.current = null;
    }
    setRollingValue(null);
  };

  const resetSession = () => {
    if (window.confirm("Bạn có chắc muốn xóa sạch lồng cầu và bắt đầu lại?")) {
      setLockedNumbers([]);
      setCurrentBatchResults([]);
      setError(null);
    }
  };

  const onDraw = async () => {
    const availablePool = (config.max - config.min + 1) - lockedNumbers.length;
    if (config.count > availablePool) {
      setError("Số lượng cần rút vượt quá số lượng số còn lại trong lồng cầu.");
      return;
    }

    setIsDrawing(true);
    setError(null);
    setCurrentBatchResults([]);
    setCurrentBallIndex(null);

    try {
      const response = await performDraw(config, lockedNumbers);
      
      if (response.error) {
        setError(response.error);
        setIsDrawing(false);
        return;
      }

      const results = response.results;
      
      // Sequential Simulation
      for (let i = 0; i < results.length; i++) {
        setCurrentBallIndex(i + 1);
        startRolling(config.min, config.max);
        
        // Duration for rolling
        await new Promise(r => setTimeout(r, 1500));
        
        stopRolling();
        const revealedNum = results[i];
        
        setCurrentBatchResults(prev => [...prev, revealedNum]);
        setLockedNumbers(prev => [...prev, revealedNum]);
        
        // Short pause between balls
        await new Promise(r => setTimeout(r, 800));
      }

      // Add to history
      const newItem: HistoryItem = {
        ...config,
        results: results,
        timestamp: new Date(),
        id: Math.random().toString(36).substr(2, 9)
      };
      setHistory(prev => [newItem, ...prev].slice(0, 20));

    } catch (err) {
      setError("Hệ thống gặp sự cố khi quay số.");
    } finally {
      setIsDrawing(false);
      setCurrentBallIndex(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-slate-950 text-slate-100">
      <div className="w-full max-w-6xl">
        
        {/* Header - Stage Style */}
        <header className="text-center mb-12 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-2 bg-indigo-500/30 blur-2xl"></div>
          <h1 className="text-5xl font-extrabold tracking-tighter mb-2 italic">
            <span className="text-indigo-500">LUCKY</span>DRAW <span className="bg-indigo-600 px-3 py-1 rounded text-white not-italic text-3xl">PRO</span>
          </h1>
          <p className="text-slate-500 font-medium uppercase tracking-[0.3em] text-xs">AI-Powered Lottery Stage</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Panel - Dark Glassmorphism */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl">
              <h2 className="text-xs font-bold text-indigo-400 uppercase mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                Bảng điều khiển
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Số bắt đầu</label>
                  <input
                    type="number"
                    name="min"
                    value={config.min}
                    onChange={handleInputChange}
                    disabled={isDrawing}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-indigo-100 font-mono text-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Số kết thúc</label>
                  <input
                    type="number"
                    name="max"
                    value={config.max}
                    onChange={handleInputChange}
                    disabled={isDrawing}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-indigo-100 font-mono text-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Số lượng rút</label>
                  <input
                    type="number"
                    name="count"
                    value={config.count}
                    onChange={handleInputChange}
                    disabled={isDrawing}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-indigo-100 font-mono text-xl"
                  />
                </div>
              </div>

              <button
                onClick={onDraw}
                disabled={isDrawing}
                className={`w-full mt-8 py-4 px-4 rounded-xl font-black text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 text-lg ${
                  isDrawing ? 'bg-slate-800 cursor-not-allowed text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/50'
                }`}
              >
                {isDrawing ? "ĐANG QUAY..." : "RÚT THĂM 🎰"}
              </button>

              <button 
                onClick={resetSession}
                className="w-full mt-4 text-[10px] text-slate-500 hover:text-red-400 font-bold uppercase transition-colors"
              >
                Xóa lồng cầu & làm mới
              </button>
            </div>

            {/* Statistics Section in Sidebar */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
               <HistoryChart history={history} />
            </div>
          </div>

          {/* Main Stage Display */}
          <div className="lg:col-span-9 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] min-h-[550px] flex flex-col items-center justify-center relative overflow-hidden stage-glow">
              {/* Stage Lighting Effect */}
              <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
              
              {isDrawing && currentBallIndex && (
                <div className="z-10 text-center animate-fade-in space-y-8">
                  <div className="space-y-2">
                    <span className="text-indigo-400 font-bold uppercase tracking-widest text-sm">Quả cầu số {currentBallIndex}</span>
                    <h3 className="text-slate-500 text-xs italic">Đang xoay lồng...</h3>
                  </div>
                  
                  <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-slate-950 border-8 border-indigo-600 flex items-center justify-center shadow-[0_0_80px_rgba(79,70,229,0.3)] relative">
                    <div className="absolute inset-4 border-2 border-dashed border-indigo-500/20 rounded-full animate-[spin_4s_linear_infinite]"></div>
                    <span className="text-7xl md:text-9xl font-black lottery-number text-white rolling-text">
                      {rollingValue ?? "?"}
                    </span>
                  </div>
                </div>
              )}

              {!isDrawing && currentBatchResults.length > 0 && (
                <div className="z-10 w-full text-center space-y-12 animate-fade-in p-8">
                  <div className="space-y-3">
                    <h3 className="text-indigo-400 font-black uppercase tracking-widest text-xl">🎉 KẾT QUẢ RÚT THĂM 🎉</h3>
                    <div className="h-1 w-32 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto"></div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                    {currentBatchResults.map((num, idx) => (
                      <div key={`res-${idx}`} className="group relative">
                        <div className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center bg-indigo-600 rounded-full shadow-[0_0_30px_rgba(79,70,229,0.5)] text-3xl md:text-5xl font-black text-white border-4 border-indigo-400 transition-transform hover:scale-110 animate-[bounceIn_0.5s_ease-out_both]">
                          {num}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">#{idx+1}</div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setCurrentBatchResults([])}
                    className="text-slate-500 hover:text-white text-xs font-bold uppercase transition-colors"
                  >
                    Tiếp tục lượt mới
                  </button>
                </div>
              )}

              {!isDrawing && currentBatchResults.length === 0 && !error && (
                <div className="z-10 text-center space-y-6 opacity-30 select-none">
                  <div className="text-9xl mb-4">🎰</div>
                  <h3 className="text-3xl font-black text-white tracking-widest">SẴN SÀNG QUAY SỐ</h3>
                  <p className="text-slate-400 max-w-sm mx-auto font-medium">Lồng cầu trống. Hãy thiết lập thông số và nhấn nút để bắt đầu sự kiện.</p>
                </div>
              )}

              {error && (
                <div className="z-10 text-center space-y-6 animate-fade-in max-w-md px-6">
                  <div className="text-6xl text-red-500">❌</div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-red-500 uppercase tracking-tighter">Lỗi Rút Thăm</h3>
                    <p className="text-slate-400 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl italic leading-relaxed">{error}</p>
                  </div>
                  <button onClick={() => setError(null)} className="text-slate-500 hover:text-white text-xs underline font-bold">Quay lại</button>
                </div>
              )}
            </div>

            {/* Pinned / Locked Numbers Display */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
               </div>
               
               <div className="flex items-center justify-between mb-8">
                 <div className="space-y-1">
                   <h4 className="text-lg font-black text-indigo-400 uppercase italic">Số đã trúng (Đã ghim)</h4>
                   <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Danh sách các quả cầu đã rời khỏi lồng</p>
                 </div>
                 <span className="bg-slate-950 px-3 py-1 rounded-full border border-slate-800 text-xs font-mono text-indigo-400">Total: {lockedNumbers.length}</span>
               </div>

               <div className="flex flex-wrap gap-3">
                 {lockedNumbers.length === 0 ? (
                   <p className="text-slate-600 text-sm italic py-4">Lồng cầu chưa có số nào bị khóa.</p>
                 ) : (
                   lockedNumbers.map((num, i) => (
                     <div key={`locked-${i}`} className="w-12 h-12 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800 text-xl font-bold text-slate-300 shadow-inner hover:border-indigo-500 hover:text-indigo-400 transition-all">
                       {num}
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>
        </div>

        <footer className="mt-16 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest py-10 border-t border-slate-900/50">
          LuckyDraw Pro &copy; 2024 • Professional Lottery Simulation • Powered by Gemini AI
        </footer>
      </div>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
