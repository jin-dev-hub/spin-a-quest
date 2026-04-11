import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subwayLines } from "@/data/subway";
import SlotMachine from "@/components/SlotMachine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shuffle } from "lucide-react";

type Region = "전체" | "서울" | "수도권";

const SubwaySelector = () => {
  const [selectedLines, setSelectedLines] = useState<string[]>(subwayLines.map((l) => l.id));
  const [region, setRegion] = useState<Region>("전체");
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultColor, setResultColor] = useState<string | undefined>();

  const toggleLine = (id: string) => {
    setSelectedLines((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedLines((prev) =>
      prev.length === subwayLines.length ? [] : subwayLines.map((l) => l.id)
    );
  };

  const spin = useCallback(() => {
    if (selectedLines.length === 0) return;
    setIsSpinning(true);
    setResult(null);

    const filtered = subwayLines.filter((l) => selectedLines.includes(l.id));
    const names = filtered.map((l) => l.name);

    setTimeout(() => {
      const chosen = filtered[Math.floor(Math.random() * filtered.length)];
      setResult(chosen.name);
      setResultColor(chosen.color);
      setIsSpinning(false);
    }, 1800);
  }, [selectedLines]);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          🚇 호선 선택기
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Region filter */}
        <div className="flex gap-2">
          {(["전체", "서울", "수도권"] as Region[]).map((r) => (
            <Button
              key={r}
              variant={region === r ? "default" : "outline"}
              size="sm"
              onClick={() => setRegion(r)}
              className="min-h-[44px] min-w-[60px]"
            >
              {r}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAll}
            className="ml-auto min-h-[44px]"
          >
            {selectedLines.length === subwayLines.length ? "전체 해제" : "전체 선택"}
          </Button>
        </div>

        {/* Line chips */}
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {subwayLines.map((line) => {
              const isSelected = selectedLines.includes(line.id);
              return (
                <motion.button
                  key={line.id}
                  layout
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleLine(line.id)}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition-all min-h-[44px] border-2"
                  style={{
                    backgroundColor: isSelected ? line.color : "transparent",
                    color: isSelected ? "white" : line.color,
                    borderColor: line.color,
                  }}
                >
                  {line.name}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Slot machine */}
        <div className="bg-muted/50 rounded-xl">
          <SlotMachine
            items={subwayLines.filter((l) => selectedLines.includes(l.id)).map((l) => l.name)}
            isSpinning={isSpinning}
            result={result}
            color={resultColor}
          />
        </div>

        <Button
          onClick={spin}
          disabled={isSpinning || selectedLines.length === 0}
          className="w-full min-h-[48px] text-base font-bold gap-2"
          size="lg"
        >
          <Shuffle className="w-5 h-5" />
          {isSpinning ? "뽑는 중..." : "랜덤 호선 뽑기"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubwaySelector;
