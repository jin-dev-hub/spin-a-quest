import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { foodPresets, activityPresets } from "@/data/subway";
import SlotMachine from "@/components/SlotMachine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Plus, Dices, Utensils, Gamepad2 } from "lucide-react";

const TodoPicker = () => {
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const addItem = () => {
    const trimmed = input.trim();
    if (!trimmed || items.length >= 10) return;
    setItems((prev) => [...prev, trimmed]);
    setInput("");
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const loadPreset = (preset: string[]) => {
    setItems([...preset]);
    setResult(null);
  };

  const spin = useCallback(() => {
    if (items.length === 0) return;
    setIsSpinning(true);
    setResult(null);

    setTimeout(() => {
      const chosen = items[Math.floor(Math.random() * items.length)];
      setResult(chosen);
      setIsSpinning(false);
    }, 1800);
  }, [items]);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          🎯 할 일 선택기
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Presets */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPreset(foodPresets)}
            className="min-h-[44px] gap-1.5 flex-1"
          >
            <Utensils className="w-4 h-4" />
            음식
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPreset(activityPresets)}
            className="min-h-[44px] gap-1.5 flex-1"
          >
            <Gamepad2 className="w-4 h-4" />
            활동
          </Button>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="직접 입력 (최대 10개)"
            className="min-h-[44px]"
            maxLength={20}
          />
          <Button
            onClick={addItem}
            disabled={!input.trim() || items.length >= 10}
            size="icon"
            className="min-h-[44px] min-w-[44px]"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* List */}
        <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={`${item}-${i}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
              >
                <span className="text-sm font-medium">{item}</span>
                <button
                  onClick={() => removeItem(i)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">
              프리셋을 선택하거나 직접 입력하세요
            </p>
          )}
        </div>

        {/* Slot machine */}
        <div className="bg-muted/50 rounded-xl">
          <SlotMachine
            items={items.length > 0 ? items : ["?"]}
            isSpinning={isSpinning}
            result={result}
          />
        </div>

        <Button
          onClick={spin}
          disabled={isSpinning || items.length === 0}
          className="w-full min-h-[48px] text-base font-bold gap-2"
          size="lg"
        >
          <Dices className="w-5 h-5" />
          {isSpinning ? "뽑는 중..." : "랜덤 선택!"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TodoPicker;
