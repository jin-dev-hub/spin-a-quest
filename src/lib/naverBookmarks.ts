/**
 * 네이버 지도 즐겨찾기 공유 폴더 응답을 앱 리스트로 옮기는 순수 로직.
 *
 * 공식 API가 아니라 지도 웹이 내부적으로 쓰는 엔드포인트라, 응답 구조가 바뀌면 여기가 먼저 깨진다.
 * 그래서 필드는 전부 없을 수 있다고 보고 다루고, 실패하면 빈 배열을 돌려준다.
 */

export const BOOKMARKS_API = "https://pages.map.naver.com/save-pages/api/maps-bookmark/v3/shares";

export interface ImportedPlace {
  name: string;
  region: string;
  url?: string;
  lat?: number;
  lng?: number;
  excluded?: boolean;
}

export interface ImportResult {
  folderName: string;
  places: ImportedPlace[];
}

const FOLDER_ID_PATTERN = /\/favorite\/[^/]+\/folder\/([a-zA-Z0-9]+)/;

export const isNaverShareLink = (raw: string): boolean => {
  try {
    const host = new URL(raw.trim()).hostname.replace(/^www\./, "");
    return host === "naver.me" || host.endsWith(".naver.com");
  } catch {
    return false;
  }
};

/** 이미 펼쳐진 지도 URL에서 폴더 id를 뽑는다. 단축 링크는 redirect를 따라간 뒤에 넘겨야 한다. */
export const extractFolderId = (raw: string): string | null => {
  const direct = raw.trim().match(FOLDER_ID_PATTERN);
  if (direct) return direct[1];
  // 폴더 id만 붙여넣은 경우도 받아준다.
  return /^[a-zA-Z0-9]{16,}$/.test(raw.trim()) ? raw.trim() : null;
};

// 응답에서 실제로 쓰는 필드만 느슨하게 받는다.
interface RawBookmark {
  name?: string;
  displayName?: string;
  address?: string;
  sid?: string;
  px?: number;
  py?: number;
  bookmarkMismatchInfo?: { details?: string[] };
}

export const parseBookmarkResponse = (payload: unknown): ImportResult => {
  const data = payload as { folder?: { name?: string }; bookmarkList?: RawBookmark[] } | null;
  const list = Array.isArray(data?.bookmarkList) ? data.bookmarkList : [];

  const places = list
    .map(toImportedPlace)
    .filter((place): place is ImportedPlace => place !== null);

  return { folderName: data?.folder?.name?.trim() || "가져온 리스트", places };
};

const toImportedPlace = (bookmark: RawBookmark): ImportedPlace | null => {
  const name = (bookmark.name || bookmark.displayName || "").trim();
  if (!name) return null;

  const place: ImportedPlace = { name, region: regionFromAddress(bookmark.address) };

  if (bookmark.sid) place.url = `https://map.naver.com/p/entry/place/${bookmark.sid}`;

  if (typeof bookmark.px === "number" && typeof bookmark.py === "number") {
    place.lng = bookmark.px;
    place.lat = bookmark.py;
  }

  // 폐업했거나 위치가 어긋난 곳은 리스트에는 남기되 뽑기 대상에서 빼둔다.
  const details = bookmark.bookmarkMismatchInfo?.details;
  if (Array.isArray(details) && !details.includes("AVAILABLE")) place.excluded = true;

  return place;
};

/**
 * 주소 문자열에서 시/군/구를 뽑는 fallback.
 * 폴더 주인의 앱 언어에 따라 한국어·영어·중국어 주소가 섞여 오므로 셋 다 본다.
 * 정확한 분류는 좌표 reverse geocoding 쪽이고, 이건 그게 실패했을 때만 쓴다.
 */
export const regionFromAddress = (address?: string): string => {
  const trimmed = address?.trim();
  if (!trimmed) return "기타";

  const tokens = trimmed.split(/\s+/);

  const rules: RegExp[] = [
    /(구|군)$/, // 성동구, 달성군
    /-(gu|gun)$/i, // Nowon-gu
    /(区|縣|县)$/, // 城东区
    /시$/, // 광명시
    /-si$/i, // Gwangmyeong-si
    /市$/, // 首尔特别市
  ];

  for (const rule of rules) {
    const hit = tokens.find((token) => rule.test(token));
    if (hit) return hit;
  }

  return "기타";
};
