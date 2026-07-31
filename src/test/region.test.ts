import { describe, it, expect } from "vitest";
import { createRegionLookup, type EncodedRegion } from "@/lib/region";
import municipalities from "@/data/municipalities.json";

const lookup = createRegionLookup(municipalities as EncodedRegion[]);

describe("경계 데이터", () => {
  it("전국 시군구가 다 들어있다", () => {
    expect(municipalities.length).toBeGreaterThan(240);
  });

  it("겹치는 이름에는 상위 지역이 붙는다", () => {
    const names = municipalities.map((m) => m[0] as string);
    expect(names).toContain("서울 중구");
    expect(names).toContain("부산 중구");
    expect(names).toContain("성동구"); // 안 겹치는 이름은 그대로
  });
});

describe("좌표 -> 시군구", () => {
  const landmarks: [string, number, number, string][] = [
    ["서울시청", 126.9779, 37.5663, "서울 중구"],
    ["홍대입구역", 126.9241, 37.5571, "마포구"],
    ["성수동 서울숲", 127.0374, 37.5444, "성동구"],
    ["코엑스", 127.0587, 37.5126, "강남구"],
    ["부산 서면역", 129.0596, 35.1578, "부산진구"],
    ["대구 동성로", 128.5947, 35.8693, "대구 중구"],
    ["제주공항", 126.493, 33.507, "제주시"],
    ["수원 화성행궁", 127.0128, 37.281, "팔달구"],
    ["광명 철산역", 126.8664, 37.4785, "광명시"],
  ];

  it.each(landmarks)("%s -> %s", (_name, lng, lat, expected) => {
    expect(lookup(lng, lat)).toBe(expected);
  });

  it("국내가 아니면 null", () => {
    expect(lookup(139.6917, 35.6895)).toBeNull(); // 도쿄
    expect(lookup(0, 0)).toBeNull();
    expect(lookup(131.0, 36.0)).toBeNull(); // 동해 한복판
  });
});
