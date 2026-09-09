import {
  BOOKMARKS_API,
  extractFolderId,
  isNaverShareLink,
  parseBookmarkResponse,
  type ImportedPlace,
} from "../src/lib/naverBookmarks";
import { createRegionLookup, type EncodedRegion } from "../src/lib/region";
import municipalities from "../src/data/municipalities.json";

/**
 * 네이버 지도 즐겨찾기 공유 폴더를 읽어 장소 리스트로 돌려준다.
 *
 * 브라우저에서 직접 부르면 CORS로 막혀서(Origin 헤더가 붙으면 403) 서버를 거친다.
 * 지역 분류는 경계 데이터로 직접 하므로 외부 API 키는 필요 없다.
 *
 * GET /api/import?link=https://naver.me/xxxxx
 */

interface VercelRequest {
  method?: string;
  query: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (key: string, value: string) => void;
}

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const lookupRegion = createRegionLookup(municipalities as EncodedRegion[]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");

  const link = typeof req.query.link === "string" ? req.query.link.trim() : "";
  if (!link) return res.status(400).json({ error: "link 파라미터가 필요합니다." });

  // 임의의 주소를 대신 호출해주는 통로가 되지 않게 네이버 도메인만 받는다.
  if (!isNaverShareLink(link) && !extractFolderId(link)) {
    return res.status(400).json({ error: "네이버 지도 공유 링크가 아닙니다." });
  }

  try {
    const folderId = await resolveFolderId(link);
    if (!folderId) {
      return res.status(404).json({
        error: "폴더를 찾을 수 없어요. 리스트가 공개로 설정되어 있는지 확인해주세요.",
      });
    }

    const response = await fetch(`${BOOKMARKS_API}/${folderId}/bookmarks`, {
      headers: { "User-Agent": BROWSER_UA, Accept: "application/json" },
    });
    if (!response.ok) {
      return res
        .status(502)
        .json({ error: `네이버에서 리스트를 가져오지 못했어요. (${response.status})` });
    }

    const { folderName, places } = parseBookmarkResponse(await response.json());
    if (places.length === 0) {
      return res.status(404).json({ error: "이 폴더에 저장된 장소가 없어요." });
    }

    const geocoded = applyRegions(places);

    return res.status(200).json({
      folderName,
      places,
      geocoded,
      total: places.length,
      unavailable: places.filter((p) => p.excluded).length,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "리스트를 가져오는 중 문제가 생겼어요.",
    });
  }
}

/** 단축 링크면 redirect를 따라가 최종 URL에서 폴더 id를 뽑는다. */
const resolveFolderId = async (link: string): Promise<string | null> => {
  const direct = extractFolderId(link);
  if (direct) return direct;

  const response = await fetch(link, {
    redirect: "follow",
    headers: { "User-Agent": BROWSER_UA },
  });
  return extractFolderId(response.url);
};

/**
 * 좌표를 시군구 이름으로 바꿔 region에 채운다.
 * 경계 밖(바다·해외)이면 주소에서 뽑아둔 값을 그대로 둔다.
 * 한 곳이라도 좌표로 판정했으면 true.
 */
const applyRegions = (places: ImportedPlace[]): boolean => {
  let resolved = 0;

  for (const place of places) {
    if (place.lat === undefined || place.lng === undefined) continue;
    const name = lookupRegion(place.lng, place.lat);
    if (name) {
      place.region = name;
      resolved += 1;
    }
  }

  return resolved > 0;
};
