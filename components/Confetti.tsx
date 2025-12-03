import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  speedY: number;
  speedX: number;
}

const Confetti: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#facc15'];
    const particleCount = 100;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100, // vw
        y: -10 - Math.random() * 20, // start above screen
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 10,
        rotation: Math.random() * 360,
        speedY: 2 + Math.random() * 3,
        speedX: -2 + Math.random() * 4,
      });
    }
    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        y: p.y + p.speedY,
        x: p.x + p.speedX,
        rotation: p.rotation + 5
      })).filter(p => p.y < 120)); // Remove if falls off screen
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: '2px'
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;