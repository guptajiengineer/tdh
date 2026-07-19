import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 200);
      }
      setProgress(current);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 bg-[var(--bg-void)] z-50 flex flex-col items-center justify-center p-6 select-none"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="w-full max-w-lg flex flex-col items-start border-l-4 border-[var(--border-default)] pl-6">
        <h1 className="font-heading font-bold text-5xl md:text-7xl text-[var(--text-primary)] uppercase tracking-tighter leading-none mb-4">
          DEVIL<br />HUNTERS.
        </h1>
        <div className="flex items-center gap-4 w-full mt-4">
          <div className="font-mono text-sm font-bold text-[var(--red-core)] w-12">
            {progress}%
          </div>
          <div className="h-2 w-full bg-[var(--bg-surface)] border border-[var(--border-default)] relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-[var(--red-core)] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
