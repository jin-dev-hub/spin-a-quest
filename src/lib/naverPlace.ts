/**
 * 네이버 지도 공유 링크 파싱.
 *
 * PC 지도 주소창에서 복사한 링크는 좌표가 URL에 그대로 들어있어서 백엔드 없이 뽑을 수 있다.
 * naver.me 단축 링크는 redirect를 따라가야 최종 URL이 나오는데, 브라우저에서는 CORS로 막히므로
 * serverless function이 붙기 전까지는 좌표 없이 링크만 저장한다. (resolveShortLink 참고)
 */

export interface ParsedPlaceLink {
  url: string;
  placeId?: string;
  lat?: number;
  lng?: number;
}

const NAVER_MAP_HOSTS = [
  "naver.me",
  "map.naver.com",
  "m.map.naver.com",
  "place.naver.com",
  "m.place.naver.com",
];

// 대한민국 대략 경계. 파싱 결과가 여기 안 들어오면 좌표로 인정하지 않는다.
const KR_BOUNDS = { minLng: 124, maxLng: 132, minLat: 33, maxLat: 39 };

const EARTH_HALF_CIRCUMFERENCE = 20037508.34;

export const isNaverMapLink = (raw: string): boolean => {
  const host = getHost(raw);
  return host !== null && NAVER_MAP_HOSTS.includes(host);
};

export const isShortLink = (raw: string): boolean => getHost(raw) === "naver.me";

export const parseNaverMapLink = (raw: string): ParsedPlaceLink | null => {
  const trimmed = raw.trim();
  if (!isNaverMapLink(trimmed)) return null;

  const url = safeParseUrl(trimmed);
  if (!url) return null;

  const parsed: ParsedPlaceLink = { url: url.toString() };

  const placeId = extractPlaceId(url.pathname);
  if (placeId) parsed.placeId = placeId;

  const coords = extractCoords(url);
  if (coords) {
    parsed.lat = coords.lat;
    parsed.lng = coords.lng;
  }

  return parsed;
};

/**
 * naver.me 단축 링크를 최종 URL로 펼친다.
 * serverless function(/api/resolve)이 생기기 전까지는 항상 null.
 */
export const resolveShortLink = async (_raw: string): Promise<ParsedPlaceLink | null> => {
  return null;
};

const getHost = (raw: string): string | null => {
  const url = safeParseUrl(raw.trim());
  return url ? url.hostname.replace(/^www\./, "") : null;
};

const safeParseUrl = (raw: string): URL | null => {
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
};

// /p/entry/place/1234567890, /restaurant/1234567890/home 등에서 숫자 id를 뽑는다.
const extractPlaceId = (pathname: string): string | undefined => {
  const match = pathname.match(/(?:place|restaurant|cafe|hairshop|accommodation)\/(\d{5,})/);
  return match?.[1];
};

const extractCoords = (url: URL): { lat: number; lng: number } | null => {
  // 1. c=경도,위도,줌,... (신 지도) — 좌표계가 WGS84일 때도, Web Mercator(m)일 때도 있다.
  const c = url.searchParams.get("c");
  if (c) {
    const [first, second] = c.split(",").map(Number);
    const fromC = normalizeCoords(first, second);
    if (fromC) return fromC;
  }

  // 2. lng/lat, x/y 개별 파라미터 (구 지도, 공유 링크 일부)
  const pairs: [string, string][] = [
    ["lng", "lat"],
    ["longitude", "latitude"],
    ["x", "y"],
  ];
  for (const [lngKey, latKey] of pairs) {
    const lng = Number(url.searchParams.get(lngKey));
    const lat = Number(url.searchParams.get(latKey));
    const normalized = normalizeCoords(lng, lat);
    if (normalized) return normalized;
  }

  return null;
};

/**
 * 경도/위도 후보를 받아 WGS84로 정규화한다.
 * 값이 크면 Web Mercator(EPSG:3857) 미터 단위로 보고 변환한다.
 */
const normalizeCoords = (lng: number, lat: number): { lat: number; lng: number } | null => {
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

  let normLng = lng;
  let normLat = lat;

  if (Math.abs(lng) > 1000 || Math.abs(lat) > 1000) {
    normLng = (lng / EARTH_HALF_CIRCUMFERENCE) * 180;
    normLat =
      (Math.atan(Math.exp(((lat / EARTH_HALF_CIRCUMFERENCE) * 180 * Math.PI) / 180)) * 360) /
        Math.PI -
      90;
  }

  const inBounds =
    normLng >= KR_BOUNDS.minLng &&
    normLng <= KR_BOUNDS.maxLng &&
    normLat >= KR_BOUNDS.minLat &&
    normLat <= KR_BOUNDS.maxLat;

  return inBounds ? { lat: normLat, lng: normLng } : null;
};
