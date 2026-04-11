import { useState, useCallback, useMemo } from "react";
import { subwayLines } from "@/data/subway";
import SlotMachine from "@/components/SlotMachine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

type Region = "전체" | "서울" | "수도권";

const StationPicker = () => {
  const [selectedLineId, setSelectedLineId] = useState<string>(subwayLines[0].id);
  const [region, setRegion] = useState<Region>("전체");
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const selectedLine = subwayLines.find((l) => l.id === selectedLineId)!;

  const filteredStations = useMemo(() => {
    if (region === "전체") return selectedLine.stations;
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

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          📍 역 선택기
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 items-center">
          <Select value={selectedLineId} onValueChange={setSelectedLineId}>
            <SelectTrigger className="min-h-[44px] flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subwayLines.map((line) => (
                <SelectItem key={line.id} value={line.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: line.color }}
                    />
                    {line.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
          <span className="ml-auto text-sm text-muted-foreground self-center">
            {filteredStations.length}개 역
          </span>
        </div>

        {/* Slot machine */}
        <div
          className="rounded-xl"
          style={{ backgroundColor: `${selectedLine.color}15` }}
        >
          <SlotMachine
            items={filteredStations.map((s) => s.name)}
            isSpinning={isSpinning}
            result={result}
            color={selectedLine.color}
          />
        </div>

        <Button
          onClick={spin}
          disabled={isSpinning || filteredStations.length === 0}
          className="w-full min-h-[48px] text-base font-bold gap-2"
          size="lg"
          style={{
            backgroundColor: selectedLine.color,
          }}
        >
          <MapPin className="w-5 h-5" />
          {isSpinning ? "뽑는 중..." : "랜덤 역 뽑기"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StationPicker;
