import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

const Header: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

  const formattedTime = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <header className="w-full flex justify-between items-center p-6 text-white/90 bg-black/20 backdrop-blur-sm fixed top-0 left-0 z-10 border-b border-white/10">
      <div className="flex items-center space-x-3 animate-float">
        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10H12V2z" transform="rotate(180 12 12)"/></svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-400 hidden sm:block">
          SorteoGenius
        </h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-sm md:text-base font-medium">
        <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-inner">
          <Calendar className="w-4 h-4 text-indigo-300" />
          <span className="capitalize">{formattedDate}</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-inner w-fit">
          <Clock className="w-4 h-4 text-pink-300" />
          <span>{formattedTime}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;