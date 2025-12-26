
import React from 'react';

interface NumberCircleProps {
  value: number;
  delay?: number;
}

const NumberCircle: React.FC<NumberCircleProps> = ({ value, delay = 0 }) => {
  return (
    <div 
      className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white border-2 border-indigo-500 rounded-full shadow-lg text-2xl md:text-3xl font-bold text-indigo-700 transition-all transform hover:scale-110 animate-fade-in"
      style={{ 
        animation: `bounceIn 0.5s ease-out ${delay}s both` 
      }}
    >
      {value}
      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default NumberCircle;
