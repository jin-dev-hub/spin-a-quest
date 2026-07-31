import { describe, it, expect } from "vitest";
import {
  extractFolderId,
  isNaverShareLink,
  parseBookmarkResponse,
  regionFromAddress,
} from "@/lib/naverBookmarks";

// 실제 공개 폴더 응답에서 형태만 남기고 줄인 것.
const response = {
  folder: { name: "🎀 서울", bookmarkCount: 4 },
  bookmarkList: [
    {
      bookmarkId: 1,
      name: "르메메 한남쇼룸",
      address: "서울 용산구 이태원로54길 58-18",
      sid: "1865449307",
      px: 127.000809,
      py: 37.535817,
      bookmarkMismatchInfo: { isMatched: true, details: ["AVAILABLE"] },
    },
    {
      bookmarkId: 2,
      name: "록집",
      address: "411-9 Seogyo-dong Mapo-gu Seoul",
      sid: "1688421773",
      px: 126.9199052,
      py: 37.5484339,
      bookmarkMismatchInfo: { isMatched: true, details: ["AVAILABLE"] },
    },
    {
      bookmarkId: 3,
      name: "문 닫은 집",
      address: "首尔特别市 中区 忠武路一街 24-12",
      sid: "999",
      px: 126.99,
      py: 37.56,
      bookmarkMismatchInfo: { isMatched: false, details: ["UNAVAILABLE"] },
    },
    {
      bookmarkId: 4,
      name: "직접 찍은 핀",
      address: "경기 광명시 양지로 19",
      px: 126.8664,
      py: 37.4785,
      bookmarkMismatchInfo: { details: ["AVAILABLE"] },
    },
  ],
};

describe("parseBookmarkResponse", () => {
  const { folderName, places } = parseBookmarkResponse(response);

  it("폴더 이름을 그대로 가져온다", () => {
    expect(folderName).toBe("🎀 서울");
  });

  it("장소를 전부 옮긴다", () => {
    expect(places.map((p) => p.name)).toEqual(["르메메 한남쇼룸", "록집", "문 닫은 집", "직접 찍은 핀"]);
  });

  it("sid가 있으면 지도 링크를 만든다", () => {
    expect(places[0].url).toBe("https://map.naver.com/p/entry/place/1865449307");
    expect(places[3].url).toBeUndefined();
  });

  it("px/py를 경도·위도로 옮긴다", () => {
    expect(places[0].lng).toBeCloseTo(127.000809, 6);
    expect(places[0].lat).toBeCloseTo(37.535817, 6);
  });

  it("AVAILABLE이 아닌 곳만 뽑기 대상에서 뺀다", () => {
    expect(places.map((p) => p.excluded ?? false)).toEqual([false, false, true, false]);
  });

  it("응답이 망가져도 터지지 않는다", () => {
    expect(parseBookmarkResponse(null).places).toEqual([]);
    expect(parseBookmarkResponse({ bookmarkList: "nope" }).places).toEqual([]);
    expect(parseBookmarkResponse({}).folderName).toBe("가져온 리스트");
    expect(parseBookmarkResponse({ bookmarkList: [{ name: "  " }] }).places).toEqual([]);
  });
});

describe("regionFromAddress", () => {
  it("한국어 주소에서 구·시를 뽑는다", () => {
    expect(regionFromAddress("서울특별시 성동구 성수이로7가길 9")).toBe("성동구");
    expect(regionFromAddress("경기 광명시 양지로 19")).toBe("광명시");
  });

  it("영문·중문 주소도 읽는다", () => {
    expect(regionFromAddress("661-4 Gongneung-dong Nowon-gu Seoul")).toBe("Nowon-gu");
    expect(regionFromAddress("首尔特别市 城东区 忠武路一街 24-12")).toBe("城东区");
  });

  it("구가 시보다 우선한다", () => {
    expect(regionFromAddress("서울특별시 용산구 이태원로")).toBe("용산구");
  });

  it("못 읽으면 기타", () => {
    expect(regionFromAddress("")).toBe("기타");
    expect(regionFromAddress(undefined)).toBe("기타");
    expect(regionFromAddress("어딘가")).toBe("기타");
  });
});

describe("링크 처리", () => {
  it("네이버 도메인만 통과시킨다", () => {
    expect(isNaverShareLink("https://naver.me/xAbCdEfG")).toBe(true);
    expect(isNaverShareLink("https://map.naver.com/p/favorite/sharedPlace/folder/abc")).toBe(true);
    expect(isNaverShareLink("https://evil.com/naver.me")).toBe(false);
    expect(isNaverShareLink("not a url")).toBe(false);
  });

  it("폴더 id를 뽑는다", () => {
    expect(
      extractFolderId("https://map.naver.com/p/favorite/sharedPlace/folder/9e33543c17774c039ac435d49f716f69/pc"),
    ).toBe("9e33543c17774c039ac435d49f716f69");
    expect(
      extractFolderId("https://map.naver.com/p/favorite/myPlace/folder/5435402fef4945da94d48602bd96144e?c=6.00,0,0"),
    ).toBe("5435402fef4945da94d48602bd96144e");
    expect(extractFolderId("5435402fef4945da94d48602bd96144e")).toBe(
      "5435402fef4945da94d48602bd96144e",
    );
    expect(extractFolderId("https://naver.me/xAbCdEfG")).toBeNull();
  });
});
