
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RefreshCw, Trophy, Sparkles, Settings2, Download, History as HistoryIcon, Timer, X, Package, Users, Hash, Plus, Trash2, Edit } from 'lucide-react';
import Header from './components/Header';
import Confetti from './components/Confetti';
import SplashScreen from './components/SplashScreen';
import { getPrizeFunFact } from './services/geminiService';
import { audioService } from './services/audioService';
import { DrawState, DrawResult, DrawMode } from './types';
import { downloadProjectZip } from './services/projectExportService';

const App: React.FC = () => {
  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // State
  const [mode, setMode] = useState<DrawMode>('NUMBERS');
  
  // Number Mode State
  const [minRange, setMinRange] = useState<string>('1');
  const [maxRange, setMaxRange] = useState<string>('100');
  
  // Names Mode State
  const [items, setItems] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemInput, setNewItemInput] = useState('');

  // General State
  const [duration, setDuration] = useState<string>('4');
  const [currentDisplayValue, setCurrentDisplayValue] = useState<string | number | null>(null);
  const [drawState, setDrawState] = useState<DrawState>(DrawState.IDLE);
  const [funFact, setFunFact] = useState<string>('');
  const [loadingFact, setLoadingFact] = useState<boolean>(false);
  const [history, setHistory] = useState<DrawResult[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Refs
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  // Load items from LocalStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('sorteoGenius_items');
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (e) {
        console.error("Error parsing saved items", e);
      }
    }
  }, []);

  // Save items to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sorteoGenius_items', JSON.stringify(items));
  }, [items]);

  const generateRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const getRandomItem = () => {
      if (items.length === 0) return "???";
      return items[Math.floor(Math.random() * items.length)];
  };

  const handleAddItem = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!newItemInput.trim()) return;
      setItems(prev => [...prev, newItemInput.trim()]);
      setNewItemInput('');
  };

  const handleDeleteItem = (index: number) => {
      setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleDraw = useCallback(() => {
    const durationSeconds = parseFloat(duration);

    if (isNaN(durationSeconds) || durationSeconds <= 0) {
      alert("Por favor ingresa una duración válida en segundos.");
      return;
    }

    let min = 0, max = 0;
    
    if (mode === 'NUMBERS') {
        min = parseInt(minRange);
        max = parseInt(maxRange);
        if (isNaN(min) || isNaN(max) || min >= max) {
            alert("Por favor ingresa un rango válido.");
            return;
        }
    } else {
        if (items.length < 2) {
            alert("Necesitas al menos 2 nombres/frases para realizar un sorteo.");
            setIsModalOpen(true);
            return;
        }
    }

    setDrawState(DrawState.DRAWING);
    setFunFact('');
    setLoadingFact(false);
    
    // Determine winner immediately
    let winner: string | number;
    if (mode === 'NUMBERS') {
        winner = generateRandomNumber(min, max);
    } else {
        winner = getRandomItem();
    }

    startTimeRef.current = Date.now();
    lastTickRef.current = 0;
    
    const totalDuration = durationSeconds * 1000;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;

      if (elapsed < totalDuration) {
        // Animation step: show random values
        if (mode === 'NUMBERS') {
            setCurrentDisplayValue(generateRandomNumber(min, max));
        } else {
            setCurrentDisplayValue(getRandomItem());
        }
        
        if (now - lastTickRef.current > 60) {
             audioService.playTick();
             lastTickRef.current = now;
        }

        // Adjust speed: faster at start, slower at end
        const progress = elapsed / totalDuration;
        const delay = 50 + (progress * 150); // Slow down to 200ms

        animationRef.current = setTimeout(animate, delay); 
      } else {
        // FINISH
        setCurrentDisplayValue(winner);
        setDrawState(DrawState.COMPLETED);
        audioService.playWin();
        
        const newResult: DrawResult = {
            id: Date.now(),
            value: winner,
            timestamp: Date.now(),
            mode: mode
        };
        
        setHistory(prev => [newResult, ...prev]);
        fetchFunFact(winner, newResult.id);
      }
    };

    animate();
  }, [minRange, maxRange, duration, mode, items]);

  const fetchFunFact = async (value: string | number, resultId: number) => {
    setLoadingFact(true);
    try {
      const fact = await getPrizeFunFact(value);
      setFunFact(fact);
      
      setHistory(prev => prev.map(item => 
        item.id === resultId ? { ...item, funFact: fact } : item
      ));
    } catch (error) {
      console.error("Error fetching fact", error);
    } finally {
      setLoadingFact(false);
    }
  };

  const handleReset = () => {
    setDrawState(DrawState.IDLE);
    setCurrentDisplayValue(null);
    setFunFact('');
  };

  const handleExport = () => {
    if (history.length === 0) return;

    let content = "HISTORIAL DE SORTEOS - SORTEOGENIUS\n";
    content += `Exportado: ${new Date().toLocaleString()}\n\n`;
    content += "----------------------------------------\n";

    history.forEach((item, index) => {
      const date = new Date(item.timestamp).toLocaleTimeString();
      content += `Resultado #${history.length - index} (${item.mode === 'NAMES' ? 'Nombre' : 'Número'}): ${item.value}\n`;
      content += `Hora: ${date}\n`;
      if (item.funFact) content += `Dato IA: ${item.funFact}\n`;
      content += "----------------------------------------\n";
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sorteos-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadProject = async () => {
      setIsExporting(true);
      try {
          await downloadProjectZip();
      } catch (error) {
          console.error("Failed to zip", error);
          alert("Hubo un error al generar el ZIP.");
      } finally {
          setIsExporting(false);
      }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, []);

  const isFocusMode = currentDisplayValue !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-inter selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* Splash Screen */}
      {isLoading && <SplashScreen onFinish={() => setIsLoading(false)} />}
      
      <Header />
      
      {drawState === DrawState.COMPLETED && <Confetti />}

      <main 
        className={`
          pt-24 px-4 pb-12 container mx-auto max-w-4xl flex flex-col items-center relative z-0 
          transition-all duration-700 ease-in-out
          ${isFocusMode ? 'blur-xl opacity-30 scale-95 pointer-events-none grayscale-[50%]' : 'opacity-100 scale-100'}
        `}
      >
        
        {/* Configuration Card */}
        <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl mb-8">
            
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-200">
              <Settings2 className="w-5 h-5" />
              Configuración
            </h2>
            
            <div className="flex items-center gap-3">
                 {/* Mode Toggle */}
                <div className="bg-black/30 p-1 rounded-lg flex items-center border border-white/10">
                    <button 
                        onClick={() => setMode('NUMBERS')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${mode === 'NUMBERS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Hash className="w-4 h-4" /> <span className="hidden sm:inline">Números</span>
                    </button>
                    <button 
                        onClick={() => setMode('NAMES')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${mode === 'NAMES' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Users className="w-4 h-4" /> <span className="hidden sm:inline">Nombres/Frases</span>
                    </button>
                </div>

                <div className="w-px h-8 bg-white/10 mx-1"></div>

                <button 
                    onClick={handleDownloadProject}
                    disabled={isExporting}
                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors border border-white/10"
                    title="Descargar Proyecto"
                >
                    {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Conditional Inputs based on Mode */}
            {mode === 'NUMBERS' ? (
                <>
                    <div className="relative group animate-in fade-in slide-in-from-left-4 duration-300">
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-bold">Desde</label>
                    <input
                        type="number"
                        value={minRange}
                        onChange={(e) => setMinRange(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all group-hover:bg-black/30"
                    />
                    </div>
                    <div className="relative group animate-in fade-in slide-in-from-left-4 duration-300 delay-75">
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-bold">Hasta</label>
                    <input
                        type="number"
                        value={maxRange}
                        onChange={(e) => setMaxRange(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all group-hover:bg-black/30"
                    />
                    </div>
                </>
            ) : (
                <div className="md:col-span-2 relative group animate-in fade-in slide-in-from-left-4 duration-300">
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-bold">Participantes ({items.length})</label>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-black/20 border border-purple-500/30 hover:border-purple-500 rounded-xl px-4 py-3 text-lg text-left flex items-center justify-between group-hover:bg-black/30 transition-all text-purple-200"
                    >
                        <span className="truncate">
                            {items.length === 0 ? "Añadir participantes..." : `${items.length} opciones configuradas`}
                        </span>
                        <Edit className="w-5 h-5 opacity-70" />
                    </button>
                </div>
            )}

             <div className="relative group">
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-bold flex items-center gap-1">
                  <Timer className="w-3 h-3" /> Tiempo (seg)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                step="0.5"
                min="1"
                className="w-full bg-black/20 border border-pink-500/30 rounded-xl px-4 py-3 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all group-hover:bg-black/30 text-pink-200"
              />
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleDraw}
              className={`
                group relative overflow-hidden px-8 py-4 rounded-2xl font-bold text-lg tracking-wide transition-all transform hover:scale-105 active:scale-95
                ${mode === 'NUMBERS' ? 'bg-gradient-to-r from-indigo-600 to-blue-600' : 'bg-gradient-to-r from-purple-600 to-fuchsia-600'}
                shadow-lg shadow-indigo-500/25
              `}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <span className="flex items-center gap-2">
                <Play className="w-6 h-6 fill-current" />
                {mode === 'NUMBERS' ? 'SORTEAR NÚMERO' : 'SORTEAR NOMBRE'}
              </span>
            </button>
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
            <div className="w-full max-w-4xl animate-in slide-in-from-bottom-10 duration-700">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-lg font-bold text-indigo-200 flex items-center gap-2">
                        <HistoryIcon className="w-5 h-5" />
                        Historial Reciente
                    </h3>
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 transition-colors"
                    >
                        <Download className="w-3 h-3" />
                        Exportar TXT
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {history.map((item, index) => (
                        <div key={item.id} className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:bg-black/30 transition-colors">
                            <div className="overflow-hidden">
                                <span className="text-xs text-slate-500 block mb-1 flex items-center gap-1">
                                    {item.mode === 'NAMES' ? <Users className="w-3 h-3" /> : <Hash className="w-3 h-3" />}
                                    {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                                </span>
                                <div className="font-bold text-xl text-slate-200 truncate" title={item.value.toString()}>
                                    {item.value}
                                </div>
                            </div>
                            {index === 0 && (
                                <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded uppercase tracking-wider border border-yellow-500/20 whitespace-nowrap ml-2">
                                    Nuevo
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {/* Footer */}
        <footer className="w-full mt-12 py-6 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm font-medium">
                © 2025 SorteoGenius. Todos los derechos reservados.
            </p>
            <p className="text-slate-600 text-xs mt-1">
                Desarrollado con ❤️ por <span className="text-indigo-400 font-semibold">Juan</span>
            </p>
        </footer>

      </main>

      {/* ITEMS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        Gestionar Participantes
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6 flex-1 overflow-hidden flex flex-col">
                    <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
                        <input 
                            type="text" 
                            value={newItemInput}
                            onChange={(e) => setNewItemInput(e.target.value)}
                            placeholder="Nombre o Frase..."
                            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            autoFocus
                        />
                        <button 
                            type="submit"
                            disabled={!newItemInput.trim()}
                            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </form>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                        {items.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 italic">
                                No hay participantes aún.<br/>Agrega algunos arriba.
                            </div>
                        ) : (
                            items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5 group hover:border-white/10 transition-colors">
                                    <span className="font-medium text-slate-200">{item}</span>
                                    <button 
                                        onClick={() => handleDeleteItem(idx)}
                                        className="text-red-400 hover:text-red-300 opacity-50 group-hover:opacity-100 transition-opacity p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                
                <div className="p-4 border-t border-white/10 bg-slate-800/50 rounded-b-2xl flex justify-between items-center">
                    <span className="text-sm text-slate-400">{items.length} en la lista</span>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Guardar y Cerrar
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* OVERLAY LAYER - Result Display in Foreground */}
      {isFocusMode && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
             <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto relative">
               
               <div className="text-center animate-in zoom-in duration-300 relative z-10 w-full">
                  <div className={`
                     font-black leading-none tracking-tighter
                     bg-clip-text text-transparent select-none text-center
                     break-words px-4
                     ${mode === 'NAMES' ? 'text-6xl md:text-8xl py-12' : 'text-[8rem] md:text-[14rem]'}
                     ${drawState === DrawState.COMPLETED 
                       ? 'bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_50px_rgba(234,179,8,0.6)] animate-winner-reveal' 
                       : 'bg-gradient-to-b from-slate-200 to-slate-500 animate-pulse'}
                  `}>
                    {currentDisplayValue}
                  </div>
                  
                  {drawState === DrawState.COMPLETED && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 flex flex-col items-center mt-8 max-w-2xl mx-auto">
                      <div className="flex items-center gap-3 text-yellow-400 text-2xl font-bold uppercase tracking-widest mb-6 drop-shadow-lg">
                        <Trophy className="w-8 h-8" />
                        <span>¡Ganador!</span>
                        <Trophy className="w-8 h-8" />
                      </div>
                      
                      <div className="bg-black/60 backdrop-blur-xl p-8 rounded-2xl border border-indigo-500/50 shadow-2xl relative overflow-hidden w-full max-w-lg">
                         <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                         <h3 className="text-indigo-300 text-sm font-bold uppercase mb-3 flex items-center gap-2">
                           <Sparkles className="w-4 h-4" />
                           {mode === 'NAMES' ? 'Mensaje de la IA' : 'Dato Curioso de la IA'}
                         </h3>
                         {loadingFact ? (
                           <div className="h-20 flex items-center justify-center space-x-2 text-slate-400">
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                           </div>
                         ) : (
                           <p className="text-xl text-slate-100 leading-relaxed italic">
                             "{funFact}"
                           </p>
                         )}
                      </div>
                    </div>
                  )}

                    <div className="mt-12 flex items-center gap-4 justify-center animate-in fade-in duration-1000 delay-500">
                        <button
                          onClick={handleDraw}
                          disabled={drawState === DrawState.DRAWING}
                          className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            <RefreshCw className={`w-5 h-5 ${drawState === DrawState.DRAWING ? 'animate-spin' : ''}`} />
                            {drawState === DrawState.DRAWING ? 'Sorteando...' : 'Sortear de nuevo'}
                        </button>
                        
                        {drawState === DrawState.COMPLETED && (
                            <button
                              onClick={handleReset}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-indigo-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <X className="w-5 h-5" />
                                Cerrar
                            </button>
                        )}
                    </div>
               </div>
             </div>
        </div>
      )}

    </div>
  );
};

export default App;
