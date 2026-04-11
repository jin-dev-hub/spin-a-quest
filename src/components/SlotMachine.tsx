import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SlotMachineProps {
  items: string[];
  isSpinning: boolean;
  result: string | null;
  color?: string;
  className?: string;
}

const SlotMachine = ({ items, isSpinning, result, color, className = "" }: SlotMachineProps) => {
  const [displayText, setDisplayText] = useState("?");

  useEffect(() => {
    if (!isSpinning) {
      if (result) setDisplayText(result);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(items[i % items.length]);
      i++;
    }, 60);

    return () => clearInterval(interval);
  }, [isSpinning, items, result]);

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={isSpinning ? "spinning" : result || "idle"}
          initial={{ y: 20, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: !isSpinning && result ? [1, 1.15, 1] : 1,
          }}
          transition={{
            y: { duration: 0.1 },
            scale: { duration: 0.4, ease: "easeOut" },
          }}
          className="text-center font-bold text-2xl md:text-3xl py-6 px-4"
          style={!isSpinning && result && color ? { color } : undefined}
        >
          {displayText}
        </motion.div>
      </AnimatePresence>
      {isSpinning && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, hsl(var(--card)) 0%, transparent 30%, transparent 70%, hsl(var(--card)) 100%)",
          }}
        />
      )}
    </div>
  );
};

export default SlotMachine;
