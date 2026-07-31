import { describe, it, expect } from "vitest";
import { isNaverMapLink, isShortLink, parseNaverMapLink } from "@/lib/naverPlace";

describe("isNaverMapLink", () => {
  it("네이버 지도 호스트를 알아본다", () => {
    expect(isNaverMapLink("https://naver.me/xAbCdEfG")).toBe(true);
    expect(isNaverMapLink("https://map.naver.com/p/entry/place/1234567890")).toBe(true);
    expect(isNaverMapLink("https://m.place.naver.com/restaurant/1234567890/home")).toBe(true);
  });

  it("다른 도메인과 잘못된 문자열은 거른다", () => {
    expect(isNaverMapLink("https://map.kakao.com/link/1234")).toBe(false);
    expect(isNaverMapLink("그냥 텍스트")).toBe(false);
    expect(isNaverMapLink("javascript:alert(1)")).toBe(false);
  });
});

describe("parseNaverMapLink", () => {
  it("place id를 뽑는다", () => {
    expect(parseNaverMapLink("https://map.naver.com/p/entry/place/1234567890")?.placeId).toBe(
      "1234567890",
    );
    expect(
      parseNaverMapLink("https://m.place.naver.com/restaurant/38491023/home")?.placeId,
    ).toBe("38491023");
  });

  it("c 파라미터의 WGS84 좌표를 읽는다", () => {
    const parsed = parseNaverMapLink(
      "https://map.naver.com/p/entry/place/1234567890?c=126.9245,37.5563,15,0,0,0,dh",
    );
    expect(parsed?.lng).toBeCloseTo(126.9245, 4);
    expect(parsed?.lat).toBeCloseTo(37.5563, 4);
  });

  it("c 파라미터가 Web Mercator 미터면 WGS84로 변환한다", () => {
    // 126.9245, 37.5563 을 EPSG:3857로 옮긴 값
    const parsed = parseNaverMapLink(
      "https://map.naver.com/p/entry/place/1234567890?c=14129170.7,4516934.1,15,0,0,0,dh",
    );
    expect(parsed?.lng).toBeCloseTo(126.9245, 3);
    expect(parsed?.lat).toBeCloseTo(37.5563, 3);
  });

  it("lng/lat 개별 파라미터도 읽는다", () => {
    const parsed = parseNaverMapLink("https://map.naver.com/v5/entry?lng=127.0276&lat=37.4979");
    expect(parsed?.lng).toBeCloseTo(127.0276, 4);
    expect(parsed?.lat).toBeCloseTo(37.4979, 4);
  });

  it("대한민국 밖 좌표는 무시한다", () => {
    const parsed = parseNaverMapLink(
      "https://map.naver.com/p/entry/place/1234567890?c=2.2945,48.8584,15,0,0,0,dh",
    );
    expect(parsed?.lat).toBeUndefined();
    expect(parsed?.lng).toBeUndefined();
  });

  it("좌표가 없는 링크는 url만 돌려준다", () => {
    const parsed = parseNaverMapLink("https://naver.me/xAbCdEfG");
    expect(parsed?.url).toBe("https://naver.me/xAbCdEfG");
    expect(parsed?.lat).toBeUndefined();
    expect(isShortLink("https://naver.me/xAbCdEfG")).toBe(true);
  });

  it("네이버 지도 링크가 아니면 null", () => {
    expect(parseNaverMapLink("https://example.com/place/1")).toBeNull();
    expect(parseNaverMapLink("")).toBeNull();
  });
});
