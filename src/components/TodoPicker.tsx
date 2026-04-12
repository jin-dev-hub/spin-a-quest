import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { foodPresets, activityPresets } from "@/data/subway";
import SlotMachine from "@/components/SlotMachine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Plus, Dices, Utensils, Gamepad2, RotateCcw, Share2, ChevronDown, ChevronUp } from "lucide-react";

const TodoPicker = () => {
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false); // 아코디언 상태 관리

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedItems = params.get("items");
    const sharedResult = params.get("todoResult");

    if (sharedItems) {
      setItems(sharedItems.split(","));
    }
    if (sharedResult) {
      setResult(sharedResult);
    }
  }, []);

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

  const resetItems = () => {
    setItems([]);
    setResult(null);
    setInput("");
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

  const copyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("items", items.join(","));
    if (result) url.searchParams.set("todoResult", result);

    navigator.clipboard.writeText(url.toString());
    alert("할 일 목록과 결과가 포함된 링크가 복사되었습니다!");
  };

  return (
      <Card className="border-0 shadow-lg overflow-hidden">
        {/* 아코디언 헤더 */}
        <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-4 px-5"
            onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="text-lg md:text-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold">🎯 랜덤 할 일 뽑기</div>
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </CardTitle>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
              <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
              >
                <CardContent className="space-y-4 pt-0 px-5 pb-5">
                  {/* Presets & Reset */}
                  <div className="flex gap-1.5">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); loadPreset(foodPresets); }}
                        className="h-10 text-xs px-2 gap-1 flex-1 bg-white hover:bg-gray-100"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      음식
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); loadPreset(activityPresets); }}
                        className="h-10 text-xs px-2 gap-1 flex-1 bg-white hover:bg-gray-100"
                    >
                      <Gamepad2 className="w-3.5 h-3.5" />
                      활동
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); resetItems(); }}
                        disabled={items.length === 0}
                        className="h-10 px-4 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addItem()}
                        placeholder="직접 입력 (최대 10개)"
                        className="h-11 text-sm"
                        maxLength={20}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                        onClick={(e) => { e.stopPropagation(); addItem(); }}
                        disabled={!input.trim() || items.length >= 10}
                        size="icon"
                        className="h-11 w-11 shrink-0"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* List */}
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                    <AnimatePresence>
                      {items.map((item, i) => (
                          <motion.div
                              key={`${item}-${i}`}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: 10, opacity: 0 }}
                              className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                          >
                            <span className="text-sm font-medium truncate pr-2">{item}</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeItem(i); }}
                                className="text-muted-foreground hover:text-destructive p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.div>
                      ))}
                    </AnimatePresence>
                    {items.length === 0 && (
                        <p className="text-center text-muted-foreground text-xs py-4">
                          카테고리를 선택하거나 직접 입력하세요
                        </p>
                    )}
                  </div>

                  {/* Slot machine - 높이 최소화 최적화 */}
                  <div className="bg-[#e5e7eb] rounded-lg py-1 px-4 flex items-center justify-center min-h-[44px]">
                    <SlotMachine
                        items={items.length > 0 ? items : ["?"]}
                        isSpinning={isSpinning}
                        result={result}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                        onClick={(e) => { e.stopPropagation(); spin(); }}
                        disabled={isSpinning || items.length === 0}
                        className="flex-1 h-12 text-sm font-bold gap-2 active:scale-95 transition-transform"
                    >
                      <Dices className="w-4 h-4" />
                      {isSpinning ? "뽑는 중..." : "할 일 뽑기"}
                    </Button>

                    {result && (
                        <Button
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); copyLink(); }}
                            className="w-12 h-12 p-0 bg-white active:scale-95 transition-transform"
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                    )}
                  </div>
                </CardContent>
              </motion.div>
          )}
        </AnimatePresence>
      </Card>
  );
};

export default TodoPicker;