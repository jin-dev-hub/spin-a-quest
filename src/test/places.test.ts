import { describe, it, expect } from "vitest";
import {
  ALL_REGIONS,
  drawPool,
  filterByRegion,
  fromTuples,
  regionsOf,
  toTuples,
  type Place,
} from "@/data/places";
import { encodeState, decodeState } from "@/lib/shareCodec";

const sample: Place[] = [
  { id: "a", name: "교대이층집", region: "강남", url: "https://naver.me/xAbCdEfG" },
  { id: "b", name: "연남동 면옥", region: "홍대", lat: 37.5563, lng: 126.9245 },
  { id: "c", name: "안 갈 집", region: "강남", excluded: true },
];

let counter = 0;
const makeId = () => `id-${counter++}`;

describe("지역 필터", () => {
  it("등록된 지역을 가나다순으로 모은다", () => {
    expect(regionsOf(sample)).toEqual(["강남", "홍대"]);
  });

  it("전체는 그대로, 특정 지역은 걸러서 돌려준다", () => {
    expect(filterByRegion(sample, ALL_REGIONS)).toHaveLength(3);
    expect(filterByRegion(sample, "강남").map((p) => p.name)).toEqual(["교대이층집", "안 갈 집"]);
  });

  it("제외 표시한 장소는 뽑기 대상에서 빠진다", () => {
    expect(drawPool(sample).map((p) => p.name)).toEqual(["교대이층집", "연남동 면옥"]);
  });
});

describe("공유용 인코딩", () => {
  it("왕복해도 이름·지역·링크·좌표·제외 여부가 유지된다", () => {
    counter = 0;
    const restored = fromTuples(toTuples(sample), makeId);

    expect(restored).toHaveLength(3);
    expect(restored.map((p) => p.name)).toEqual(sample.map((p) => p.name));
    expect(restored[0].url).toBe(sample[0].url);
    expect(restored[1].lat).toBeCloseTo(37.5563, 5);
    expect(restored[1].lng).toBeCloseTo(126.9245, 5);
    expect(restored[1].url).toBeUndefined();
    expect(restored[2].excluded).toBe(true);
  });

  it("id는 받는 쪽에서 새로 만든다", () => {
    counter = 0;
    const restored = fromTuples(toTuples(sample), makeId);
    expect(restored.map((p) => p.id)).toEqual(["id-0", "id-1", "id-2"]);
  });

  it("빈 칸은 잘라내서 링크를 짧게 만든다", () => {
    const [tuple] = toTuples([{ id: "x", name: "김밥천국", region: "노원" }]);
    expect(tuple).toEqual(["김밥천국", "노원"]);
  });

  it("한글이 섞여도 base64url 왕복이 깨지지 않는다", () => {
    const encoded = encodeState(toTuples(sample));
    expect(encoded).not.toMatch(/[+/=]/);
    expect(decodeState(encoded)).toEqual(toTuples(sample));
  });

  it("망가진 값은 조용히 버린다", () => {
    counter = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const broken = [["정상집", "강남"], [""], [123], null] as any;
    expect(fromTuples(broken, makeId).map((p) => p.name)).toEqual(["정상집"]);
    expect(decodeState("!!!not-base64!!!")).toBeNull();
  });
});
