import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subwayLines, RegionGroup } from "@/data/subway";
import SlotMachine from "@/components/SlotMachine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shuffle, Share2, ChevronDown, ChevronUp } from "lucide-react";

const SubwaySelector = () => {
  const [region, setRegion] = useState<RegionGroup>("수도권");
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedResult = params.get("lineResult");
    if (sharedResult) setResult(sharedResult);
  }, []);

  useEffect(() => {
    const filtered = subwayLines.filter((l) => l.regionGroup === region).map((l) => l.id);
    setSelectedLines(filtered);
  }, [region]);

  const toggleLine = (id: string) => {
    if (isSpinning) return;
    setSelectedLines((prev) =>
        prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (isSpinning) return;
    const regionLines = subwayLines.filter((l) => l.regionGroup === region).map((l) => l.id);
    setSelectedLines((prev) => (prev.length === regionLines.length ? [] : regionLines));
  };

  const spin = useCallback(() => {
    if (selectedLines.length === 0) return;
    setIsSpinning(true);
    setResult(null);

    const filtered = subwayLines.filter((l) => selectedLines.includes(l.id));
    setTimeout(() => {
      const chosen = filtered[Math.floor(Math.random() * filtered.length)];
      setResult(chosen.name);
      setIsSpinning(false);
    }, 1800);
  }, [selectedLines]);

  const copyLink = () => {
    const url = new URL(window.location.href);
    if (result) url.searchParams.set("lineResult", result);
    navigator.clipboard.writeText(url.toString());
    alert("공유 링크가 복사되었습니다!");
  };

  return (
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader
            // 수정사항: hover 효과 및 cursor-pointer 제거, select-none 추가
            className="py-4 px-5 select-none"
            onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="text-lg md:text-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold">🚇 랜덤 호선 뽑기</div>
            <div className="p-1">
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
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
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {(["서울", "수도권", "부산", "대구", "대전"] as RegionGroup[]).map((r) => (
                          <Button
                              key={r}
                              variant={region === r ? "default" : "secondary"}
                              disabled={isSpinning}
                              className={`h-10 min-w-[54px] text-xs px-2 shrink-0 ${region !== r && "bg-gray-100"}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setRegion(r);
                              }}
                          >
                            {r}
                          </Button>
                      ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isSpinning}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAll();
                        }}
                        className="h-10 px-3 border-2 bg-white text-xs font-bold transition-colors md:hover:bg-gray-50 focus:bg-white active:bg-gray-100 shrink-0"
                    >
                      {selectedLines.length > 0 ? "전체 해제" : "전체 선택"}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {subwayLines.filter((l) => l.regionGroup === region).map((line) => {
                      const isSelected = selectedLines.includes(line.id);
                      return (
                          <button
                              key={line.id}
                              disabled={isSpinning}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLine(line.id);
                              }}
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold border-2 transition-all 
                                ${isSpinning ? "opacity-50 cursor-not-allowed" : "active:scale-95"}`}
                              style={{
                                backgroundColor: isSelected ? line.color : "white",
                                color: isSelected ? "white" : line.color,
                                borderColor: line.color,
                              }}
                          >
                            {line.name}
                          </button>
                      );
                    })}
                  </div>

                  <div className="bg-[#e5e7eb] rounded-lg py-1 px-4 flex items-center justify-center min-h-[44px]">
                    <SlotMachine
                        items={subwayLines.filter((l) => selectedLines.includes(l.id)).map((l) => l.name)}
                        isSpinning={isSpinning}
                        result={result}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          spin();
                        }}
                        disabled={isSpinning || selectedLines.length === 0}
                        className={`flex-1 h-12 font-bold transition-all active:scale-95 
                          ${isSpinning ? "!bg-white !text-black border-2" : "text-white hover:brightness-90"}`}
                        style={{
                          backgroundColor: isSpinning ? "white" : undefined,
                          borderColor: isSpinning ? "#e5e7eb" : "transparent"
                        }}
                    >
                      <Shuffle className="mr-2 h-4 w-4" />
                      {isSpinning ? "뽑는 중..." : "호선 뽑기"}
                    </Button>
                    {result && (
                        <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyLink();
                            }}
                            className="w-12 h-12 p-0 active:scale-95 transition-transform"
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

export default SubwaySelector;