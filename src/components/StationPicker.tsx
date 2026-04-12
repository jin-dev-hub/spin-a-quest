import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subwayLines, RegionGroup } from "@/data/subway.ts";
import SlotMachine from "@/components/SlotMachine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Share2, Shuffle, ChevronDown, ChevronUp } from "lucide-react";

const StationPicker = () => {
  const [selectedLineId, setSelectedLineId] = useState<string>(subwayLines[0].id);
  const [region, setRegion] = useState<RegionGroup>("수도권");
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false); // 아코디언 상태

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedStation = params.get("stationResult");
    if (sharedStation) setResult(sharedStation);
  }, []);

  const availableLines = useMemo(() => {
    if (region === "서울") {
      return subwayLines.filter((l) =>
          l.stations.some((s) => s.region === "서울")
      );
    }
    return subwayLines.filter((l) => l.regionGroup === region);
  }, [region]);

  useEffect(() => {
    if (availableLines.length > 0) {
      const isStillAvailable = availableLines.some(l => l.id === selectedLineId);
      if (!isStillAvailable) {
        setSelectedLineId(availableLines[0].id);
      }
    }
  }, [availableLines, selectedLineId]);

  const selectedLine = useMemo(() =>
          subwayLines.find((l) => l.id === selectedLineId) || availableLines[0]
      , [selectedLineId, availableLines]);

  const filteredStations = useMemo(() => {
    if (!selectedLine || !selectedLine.stations) return [];
    if (region === "서울") {
      return selectedLine.stations.filter((s) => s.region === "서울");
    }
    return selectedLine.stations.filter((s) => s.region === region);
  }, [selectedLine, region]);

  const spin = useCallback(() => {
    if (filteredStations.length === 0) return;
    setIsSpinning(true);
    setResult(null);

    setTimeout(() => {
      const chosen = filteredStations[Math.floor(Math.random() * filteredStations.length)];
      setResult(chosen.name);
      setIsSpinning(false);
    }, 1800);
  }, [filteredStations]);

  const copyLink = () => {
    const url = new URL(window.location.href);
    if (result) url.searchParams.set("stationResult", result);
    navigator.clipboard.writeText(url.toString());
    alert("공유 링크가 복사되었습니다!");
  };

  return (
      <Card className="border-0 shadow-lg overflow-hidden">
        {/* 아코디언 헤더 */}
        <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-4 px-5"
            onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="text-lg md:text-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold">📍 랜덤 역 뽑기</div>
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
                  {/* 지역 필터 버튼 */}
                  <div className="flex gap-1">
                    {(["서울", "수도권", "부산", "대구", "대전"] as RegionGroup[]).map((r) => (
                        <Button
                            key={r}
                            variant={region === r ? "default" : "secondary"}
                            className={`flex-1 h-10 text-[13px] px-0 min-w-0 ${region !== r && "bg-gray-100"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRegion(r);
                            }}
                        >
                          {r}
                        </Button>
                    ))}
                  </div>

                  {/* 호선 선택 */}
                  <Select value={selectedLineId} onValueChange={setSelectedLineId}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="호선 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLines.map((line) => (
                          <SelectItem key={line.id} value={line.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: line.color }} />
                              <span className="truncate">{line.name}</span>
                            </div>
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* 결과 박스: 높이 최소화 */}
                  <div className="bg-[#e5e7eb] rounded-lg py-1 px-4 flex items-center justify-center min-h-[44px]">
                    <div className="w-full flex justify-center">
                      <SlotMachine
                          items={filteredStations.map((s) => s.name)}
                          isSpinning={isSpinning}
                          result={result}
                          textColor="black"
                      />
                    </div>
                  </div>

                  {/* 실행 및 공유 버튼 */}
                  <div className="flex gap-2">
                    <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          spin();
                        }}
                        disabled={isSpinning || filteredStations.length === 0}
                        className="flex-1 h-12 font-bold text-white active:scale-95 transition-transform"
                        style={{ backgroundColor: selectedLine?.color || "#000" }}
                    >
                      <Shuffle className="mr-2 h-4 w-4" />역 뽑기
                    </Button>
                    {result && (
                        <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyLink();
                            }}
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

export default StationPicker;