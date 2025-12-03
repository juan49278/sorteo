
import React, { useEffect, useState } from 'react';
import { Ticket, Sparkles, Trophy } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2; // Speed of loading
      });
    }, 40); // Total time approx 2 seconds

    // Finish callback
    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 700); // Wait for fade out animation
    }, 2500);

    return () => {
      clearInterval(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Icon Composition */}
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative">
                <Ticket className="w-24 h-24 text-white rotate-[-10deg] animate-float drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                <Sparkles className="absolute -top-2 -right-4 w-10 h-10 text-yellow-400 animate-bounce" style={{ animationDuration: '2s' }} />
                <Trophy className="absolute -bottom-2 -left-4 w-12 h-12 text-pink-500 rotate-[15deg] animate-pulse" />
            </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-200 tracking-tighter mb-2 animate-in slide-in-from-bottom-5 duration-700">
          SorteoGenius
        </h1>
        <p className="text-slate-400 text-sm uppercase tracking-[0.3em] animate-in slide-in-from-bottom-5 duration-700 delay-100 mb-12">
          Preparando la suerte
        </p>

        {/* Custom Progress Bar */}
        <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
            <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
            ></div>
            {/* Shimmer effect on bar */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1s_infinite]"></div>
        </div>
        
        <div className="mt-4 text-xs font-mono text-slate-500">
            Cargando motor de IA... {progress}%
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
