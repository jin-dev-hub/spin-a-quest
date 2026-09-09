import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ALL_REGIONS,
  MAX_SHARE_URL_LENGTH,
  STORAGE_KEY,
  drawPool,
  filterByRegion,
  fromTuples,
  naverSearchUrl,
  regionsOf,
  toTuples,
  type Place,
  type PlaceTuple,
} from "@/data/places";
import { parseNaverMapLink, isShortLink } from "@/lib/naverPlace";
import type { ImportedPlace } from "@/lib/naverBookmarks";
import { encodeState, decodeState } from "@/lib/shareCodec";
import SlotMachine from "@/components/SlotMachine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  X,
  Plus,
  Dices,
  RotateCcw,
  Share2,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  Link2,
  FolderDown,
  Loader2,
} from "lucide-react";

const DEFAULT_REGION = "기타";

// 같은 장소를 두 번 가져오지 않도록 링크가 있으면 링크로, 없으면 이름으로 본다.
const dedupeKey = (place: Pick<Place, "name" | "url">) => place.url ?? `name:${place.name}`;

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const PlacePicker = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [region, setRegion] = useState(ALL_REGIONS);
  const [nameInput, setNameInput] = useState("");
  const [regionInput, setRegionInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [importLink, setImportLink] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<Place | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const hasLoaded = useRef(false);

  // 공유 링크가 있으면 그걸 우선, 없으면 이전에 저장해둔 리스트를 복원한다.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("places");

    if (shared) {
      const tuples = decodeState<PlaceTuple[]>(shared);
      if (Array.isArray(tuples) && tuples.length) {
        const restored = fromTuples(tuples, newId);
        setPlaces(restored);

        const rawIndex = params.get("placeResult");
        const index = rawIndex === null ? -1 : Number(rawIndex);
        if (Number.isInteger(index) && restored[index]) setResult(restored[index]);

        setIsExpanded(true);
        hasLoaded.current = true;
        return;
      }
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? (JSON.parse(saved) as Place[]) : null;
      if (Array.isArray(parsed) && parsed.length) setPlaces(parsed);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    hasLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
    } catch {
      // 저장 공간이 꽉 차도 뽑기는 계속 돌아가야 하니 조용히 넘어간다.
    }
  }, [places]);

  const regions = useMemo(() => regionsOf(places), [places]);
  const visiblePlaces = useMemo(() => filterByRegion(places, region), [places, region]);
  const pool = useMemo(() => drawPool(visiblePlaces), [visiblePlaces]);

  // 선택해둔 지역의 장소가 전부 지워지면 '전체'로 되돌린다.
  useEffect(() => {
    if (region !== ALL_REGIONS && !regions.includes(region)) setRegion(ALL_REGIONS);
  }, [regions, region]);

  const parsedLink = useMemo(
    () => (linkInput.trim() ? parseNaverMapLink(linkInput) : null),
    [linkInput],
  );

  const addPlace = () => {
    const name = nameInput.trim();
    if (!name) return;

    const place: Place = {
      id: newId(),
      name,
      region: regionInput.trim() || DEFAULT_REGION,
    };

    if (parsedLink) {
      place.url = parsedLink.url;
      if (parsedLink.lat !== undefined && parsedLink.lng !== undefined) {
        place.lat = parsedLink.lat;
        place.lng = parsedLink.lng;
      }
    }

    setPlaces((prev) => [...prev, place]);
    setNameInput("");
    setLinkInput("");
  };

  // 네이버 지도 즐겨찾기 공유 폴더를 통째로 가져온다. 이미 있는 곳은 건너뛴다.
  const importFolder = async () => {
    const link = importLink.trim();
    if (!link || isImporting) return;

    setIsImporting(true);
    setImportMessage(null);

    try {
      const response = await fetch(`/api/import?link=${encodeURIComponent(link)}`);
      const body = (await response.json()) as {
        error?: string;
        folderName?: string;
        places?: ImportedPlace[];
        geocoded?: boolean;
        unavailable?: number;
      };

      if (!response.ok || !body.places?.length) {
        setImportMessage({ ok: false, text: body.error ?? "리스트를 가져오지 못했어요." });
        return;
      }

      const existing = new Set(places.map(dedupeKey));
      const fresh = body.places
        .map((p) => ({ ...p, id: newId() }) as Place)
        .filter((p) => !existing.has(dedupeKey(p)));

      if (fresh.length === 0) {
        setImportMessage({ ok: false, text: "이미 모두 가져온 리스트예요." });
        return;
      }

      setPlaces((prev) => [...prev, ...fresh]);
      setImportLink("");

      const skipped = body.places.length - fresh.length;
      const notes = [
        `'${body.folderName}'에서 ${fresh.length}곳을 가져왔어요.`,
        skipped > 0 ? `${skipped}곳은 이미 있어서 건너뛰었고요.` : "",
        body.unavailable ? `폐업·이전으로 보이는 ${body.unavailable}곳은 체크를 풀어뒀어요.` : "",
        body.geocoded === false ? "지역은 주소에서 추정한 값이에요." : "",
      ];
      setImportMessage({ ok: true, text: notes.filter(Boolean).join(" ") });
    } catch {
      setImportMessage({
        ok: false,
        text: "가져오기 API에 닿지 못했어요. 배포본이나 vercel dev에서 시도해주세요.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const removePlace = (id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
    setResult((prev) => (prev?.id === id ? null : prev));
  };

  const togglePlace = (id: string) => {
    setPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, excluded: !p.excluded } : p)));
  };

  // 지금 보고 있는 지역만 한꺼번에 켜고 끈다.
  const toggleAllVisible = () => {
    const nextExcluded = pool.length > 0;
    const visibleIds = new Set(visiblePlaces.map((p) => p.id));
    setPlaces((prev) =>
      prev.map((p) => (visibleIds.has(p.id) ? { ...p, excluded: nextExcluded } : p)),
    );
  };

  const resetPlaces = () => {
    setPlaces([]);
    setResult(null);
    setNameInput("");
    setRegionInput("");
    setLinkInput("");
    setRegion(ALL_REGIONS);
  };

  const spin = useCallback(() => {
    if (pool.length === 0) return;
    setIsSpinning(true);
    setResult(null);

    setTimeout(() => {
      setResult(pool[Math.floor(Math.random() * pool.length)]);
      setIsSpinning(false);
    }, 1800);
  }, [pool]);

  const buildShareUrl = (subset: Place[]) => {
    const url = new URL(window.location.href);
    url.searchParams.set("places", encodeState(toTuples(subset)));

    const index = result ? subset.findIndex((p) => p.id === result.id) : -1;
    if (index >= 0) url.searchParams.set("placeResult", String(index));
    else url.searchParams.delete("placeResult");

    return url.toString();
  };

  /**
   * 장소가 많으면 링크가 메신저에서 잘리므로, 길이를 넘으면 담는 범위를 좁혀가며 재시도한다.
   * 전체 → 보고 있는 지역 → 결과 한 곳 순.
   */
  const copyLink = () => {
    const candidates: { subset: Place[]; note: string }[] = [{ subset: places, note: "" }];
    if (region !== ALL_REGIONS) {
      candidates.push({
        subset: visiblePlaces,
        note: `장소가 많아 '${region}' 지역만 담았어요.`,
      });
    }
    if (result) {
      candidates.push({ subset: [result], note: "장소가 많아 결과 한 곳만 담았어요." });
    }

    const picked =
      candidates.find(({ subset }) => buildShareUrl(subset).length <= MAX_SHARE_URL_LENGTH) ??
      candidates[candidates.length - 1];

    navigator.clipboard.writeText(buildShareUrl(picked.subset));
    alert(
      picked.note
        ? `링크가 복사되었습니다!\n${picked.note}`
        : "맛집 리스트와 결과가 포함된 링크가 복사되었습니다!",
    );
  };

  const openInMap = (place: Place) => {
    window.open(place.url ?? naverSearchUrl(place.name), "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="py-4 px-5 select-none" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="text-lg md:text-xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold">📍 랜덤 맛집 뽑기</div>
          <div className="p-1">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
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
              <div className="space-y-2 bg-muted/40 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <FolderDown className="w-4 h-4" />
                  즐겨찾기 폴더 통째로 가져오기
                </div>
                <div className="flex gap-2">
                  <Input
                    value={importLink}
                    disabled={isImporting || isSpinning}
                    onChange={(e) => setImportLink(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && importFolder()}
                    placeholder="네이버 지도 리스트 공유 링크"
                    className="h-11 text-sm bg-white disabled:bg-gray-50"
                  />
                  <Button
                    onClick={importFolder}
                    disabled={isImporting || isSpinning || !importLink.trim()}
                    className="h-11 px-4 shrink-0 text-xs font-bold"
                  >
                    {isImporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "가져오기"
                    )}
                  </Button>
                </div>
                <p
                  className={`text-[11px] leading-relaxed ${
                    importMessage?.ok === false ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {importMessage?.text ??
                    "네이버 지도 앱에서 리스트를 공개로 바꾼 뒤 공유한 링크를 넣어주세요."}
                </p>
              </div>

              {regions.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                  {[ALL_REGIONS, ...regions].map((r) => (
                    <button
                      key={r}
                      disabled={isSpinning}
                      onClick={() => setRegion(r)}
                      className={`shrink-0 h-9 px-3 rounded-full text-xs font-medium transition-colors disabled:opacity-50
                        ${
                          region === r
                            ? "bg-primary text-primary-foreground"
                            : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                        }`}
                    >
                      {r}
                      <span className="ml-1 opacity-70">
                        {drawPool(filterByRegion(places, r)).length}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={nameInput}
                    disabled={isSpinning}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPlace()}
                    placeholder="가게 이름"
                    className="h-11 text-sm disabled:bg-gray-50 flex-[3]"
                    maxLength={30}
                  />
                  <Input
                    value={regionInput}
                    disabled={isSpinning}
                    onChange={(e) => setRegionInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPlace()}
                    placeholder="지역"
                    list="place-regions"
                    className="h-11 text-sm disabled:bg-gray-50 flex-[2] min-w-0"
                    maxLength={10}
                  />
                  <datalist id="place-regions">
                    {regions.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={linkInput}
                    disabled={isSpinning}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPlace()}
                    placeholder="네이버 지도 링크 (선택)"
                    className="h-11 text-sm disabled:bg-gray-50"
                  />
                  <Button
                    onClick={addPlace}
                    disabled={isSpinning || !nameInput.trim()}
                    size="icon"
                    className="h-11 w-11 shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>

                {linkInput.trim() && (
                  <p className="text-[11px] leading-relaxed px-1">
                    {parsedLink?.lat !== undefined ? (
                      <span className="text-emerald-600">
                        📍 좌표 확인됨 ({parsedLink.lat.toFixed(5)}, {parsedLink.lng!.toFixed(5)})
                      </span>
                    ) : parsedLink && isShortLink(linkInput) ? (
                      <span className="text-muted-foreground">
                        단축 링크는 좌표를 읽을 수 없어요. 링크는 저장되니 지역만 직접 적어주세요.
                      </span>
                    ) : parsedLink ? (
                      <span className="text-muted-foreground">
                        좌표가 없는 링크예요. 링크는 저장되니 지역만 직접 적어주세요.
                      </span>
                    ) : (
                      <span className="text-destructive">네이버 지도 링크가 아닌 것 같아요.</span>
                    )}
                  </p>
                )}
              </div>

              {visiblePlaces.length > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {visiblePlaces.length}곳 중 <b className="text-foreground">{pool.length}곳</b>{" "}
                    뽑기 대상
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSpinning}
                    onClick={toggleAllVisible}
                    className="h-8 px-3 border-2 bg-white text-xs font-bold transition-colors md:hover:bg-gray-50 focus:bg-white active:bg-gray-100 shrink-0"
                  >
                    {pool.length > 0 ? "전체 해제" : "전체 선택"}
                  </Button>
                </div>
              )}

              <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {visiblePlaces.map((place) => (
                    <motion.div
                      key={place.id}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 10, opacity: 0 }}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 gap-2 transition-colors
                        ${place.excluded ? "bg-muted/20" : "bg-muted/50"}`}
                    >
                      <label className="flex items-center gap-2.5 min-w-0 cursor-pointer">
                        <Checkbox
                          checked={!place.excluded}
                          disabled={isSpinning}
                          onCheckedChange={() => togglePlace(place.id)}
                          className="shrink-0"
                        />
                        <span
                          className={`text-sm font-medium truncate ${
                            place.excluded ? "text-muted-foreground line-through" : ""
                          }`}
                        >
                          {place.name}
                        </span>
                        {region === ALL_REGIONS && (
                          <span className="shrink-0 text-[10px] text-muted-foreground bg-white rounded-full px-2 py-0.5">
                            {place.region}
                          </span>
                        )}
                        {place.url && <Link2 className="w-3 h-3 shrink-0 text-muted-foreground" />}
                      </label>
                      <button
                        disabled={isSpinning}
                        onClick={() => removePlace(place.id)}
                        className="shrink-0 text-muted-foreground hover:text-destructive p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {visiblePlaces.length === 0 && (
                  <p className="text-center text-muted-foreground text-xs py-4">
                    {places.length === 0
                      ? "가게 이름과 지역을 입력해 리스트를 만들어보세요"
                      : "이 지역에 등록된 가게가 없어요"}
                  </p>
                )}
              </div>

              <div className="bg-[#e5e7eb] rounded-lg py-1 px-4 flex items-center justify-center min-h-[44px]">
                <SlotMachine
                  items={pool.length > 0 ? pool.map((p) => p.name) : ["?"]}
                  isSpinning={isSpinning}
                  result={result?.name ?? null}
                />
              </div>

              {result && !isSpinning && (
                <Button
                  variant="outline"
                  onClick={() => openInMap(result)}
                  className="w-full h-11 gap-2 bg-white text-sm active:scale-95 transition-transform"
                >
                  <MapPin className="w-4 h-4" />
                  네이버 지도에서 열기
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Button>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={spin}
                  disabled={isSpinning || pool.length === 0}
                  className={`flex-1 h-12 text-sm font-bold gap-2 active:scale-95 transition-transform
                    ${isSpinning ? "hover:bg-primary opacity-90 cursor-default" : "hover:bg-primary/90"}`}
                  size="lg"
                >
                  <Dices className="w-4 h-4" />
                  {isSpinning ? "뽑는 중..." : "맛집 뽑기"}
                </Button>

                <Button
                  variant="ghost"
                  disabled={isSpinning || places.length === 0}
                  onClick={resetPlaces}
                  className={`h-12 px-4 transition-colors
                    ${
                      places.length > 0
                        ? "bg-gray-100 text-muted-foreground hover:bg-gray-200 hover:text-red-500"
                        : "bg-transparent opacity-50 hover:bg-transparent cursor-default"
                    }`}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                {result && (
                  <Button
                    variant="outline"
                    onClick={copyLink}
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

export default PlacePicker;
