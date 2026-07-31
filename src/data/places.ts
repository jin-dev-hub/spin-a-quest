export interface Place {
  id: string;
  name: string;
  region: string;
  url?: string;
  // 링크에서 좌표를 뽑아낸 경우에만 채워진다. 지역 자동 분류에 쓸 값.
  lat?: number;
  lng?: number;
  // 리스트에는 남기되 뽑기 대상에서만 빼둔 상태.
  excluded?: boolean;
}

export const ALL_REGIONS = "전체";
export const STORAGE_KEY = "steppicker:places";

// 공유 링크가 너무 길어지면 메신저에서 잘리므로, 이 길이를 넘으면 담는 범위를 줄인다.
export const MAX_SHARE_URL_LENGTH = 2000;

export const regionsOf = (places: Place[]): string[] =>
  [...new Set(places.map((p) => p.region).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "ko"),
  );

export const filterByRegion = (places: Place[], region: string): Place[] =>
  region === ALL_REGIONS ? places : places.filter((p) => p.region === region);

export const drawPool = (places: Place[]): Place[] => places.filter((p) => !p.excluded);

export const naverSearchUrl = (name: string): string =>
  `https://map.naver.com/p/search/${encodeURIComponent(name)}`;

/**
 * 공유 링크용 압축 표현.
 * id는 받는 쪽에서 새로 만들면 되고 좌표는 소수점 5자리(약 1m)면 충분하다.
 * 뒤쪽 빈 칸은 잘라내서 링크 하나에 최대한 많은 장소가 들어가게 한다.
 */
// 좌표가 없으면 0. JSON에 undefined를 남기면 null로 바뀌어 왕복이 흔들린다.
export type PlaceTuple = [string, string, string?, number?, number?, (0 | 1)?];

export const toTuples = (places: Place[]): PlaceTuple[] =>
  places.map((p) => {
    const tuple: PlaceTuple = [
      p.name,
      p.region,
      p.url ?? "",
      round5(p.lat),
      round5(p.lng),
      p.excluded ? 1 : 0,
    ];
    while (tuple.length > 2 && !tuple[tuple.length - 1]) tuple.pop();
    return tuple;
  });

export const fromTuples = (tuples: PlaceTuple[], makeId: () => string): Place[] =>
  tuples
    .filter((t) => Array.isArray(t) && typeof t[0] === "string" && t[0].length > 0)
    .map(([name, region, url, lat, lng, excluded]) => {
      const place: Place = { id: makeId(), name, region: region || "기타" };
      if (url) place.url = url;
      // 0,0은 대서양 한복판이라 실제 좌표일 리 없다. 좌표 없음으로 본다.
      if (typeof lat === "number" && typeof lng === "number" && lat !== 0 && lng !== 0) {
        place.lat = lat;
        place.lng = lng;
      }
      if (excluded) place.excluded = true;
      return place;
    });

const round5 = (value?: number): number =>
  typeof value === "number" ? Math.round(value * 1e5) / 1e5 : 0;
