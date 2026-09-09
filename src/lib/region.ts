/**
 * 좌표를 시군구 이름으로 바꾼다. 외부 API 없이 경계 데이터로 직접 판정한다.
 *
 * 데이터는 `src/data/municipalities.json` (KOSTAT 2013 센서스용 행정구역경계를 줄인 것).
 * 즐겨찾기 주소가 폴더 주인의 앱 언어를 따라 한국어·영어·중국어로 섞여 오기 때문에,
 * 주소를 파싱하는 대신 좌표로 판정해야 그룹 이름이 한국어로 일정하게 나온다.
 *
 * 좌표는 1/10000도 정수의 차이값으로 저장돼 있다. 파일 크기를 절반 이하로 줄이려는 것.
 */

/** [이름, [minLng, minLat, maxLng, maxLat], [ring, ...]] — 모두 1/10000도 정수 */
export type EncodedRegion = [string, number[], number[][]];

interface Region {
  name: string;
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
  rings: Float64Array[];
}

const SCALE = 1e4;

const decodeRing = (encoded: number[]): Float64Array => {
  const ring = new Float64Array(encoded.length);
  let x = 0;
  let y = 0;
  for (let i = 0; i < encoded.length; i += 2) {
    x += encoded[i];
    y += encoded[i + 1];
    ring[i] = x / SCALE;
    ring[i + 1] = y / SCALE;
  }
  return ring;
};

const decodeRegion = ([name, bbox, rings]: EncodedRegion): Region => ({
  name,
  minLng: bbox[0] / SCALE,
  minLat: bbox[1] / SCALE,
  maxLng: bbox[2] / SCALE,
  maxLat: bbox[3] / SCALE,
  rings: rings.map(decodeRing),
});

/** ray casting. 링이 여러 개면 홀짝으로 세서 구멍과 섬을 함께 처리한다. */
const isInside = (ring: Float64Array, lng: number, lat: number): boolean => {
  let inside = false;
  const count = ring.length / 2;
  let j = count - 1;

  for (let i = 0; i < count; i += 1) {
    const xi = ring[2 * i];
    const yi = ring[2 * i + 1];
    const xj = ring[2 * j];
    const yj = ring[2 * j + 1];

    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
    j = i;
  }
  return inside;
};

const contains = (region: Region, lng: number, lat: number): boolean => {
  if (lng < region.minLng || lng > region.maxLng || lat < region.minLat || lat > region.maxLat) {
    return false;
  }
  let crossings = 0;
  for (const ring of region.rings) {
    if (isInside(ring, lng, lat)) crossings += 1;
  }
  return crossings % 2 === 1;
};

/** 경계를 줄이는 과정에서 생긴 틈에 좌표가 빠졌을 때 붙여줄 최대 거리. 약 2km. */
const SNAP_DISTANCE = 0.02;

/** 어느 경계에도 안 들어간 점을 가장 가까운 경계에 붙인다. 너무 멀면 포기한다(바다·해외). */
const nearest = (regions: Region[], lng: number, lat: number): string | null => {
  let best: string | null = null;
  let bestDistance = SNAP_DISTANCE;

  for (const region of regions) {
    if (
      lng < region.minLng - bestDistance ||
      lng > region.maxLng + bestDistance ||
      lat < region.minLat - bestDistance ||
      lat > region.maxLat + bestDistance
    ) {
      continue;
    }

    for (const ring of region.rings) {
      for (let i = 0; i < ring.length; i += 2) {
        const distance = Math.hypot(ring[i] - lng, ring[i + 1] - lat);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = region.name;
        }
      }
    }
  }

  return best;
};

/**
 * 데이터셋을 받아 조회 함수를 만든다.
 * 데이터를 인자로 받는 건 프런트 번들에 295KB가 딸려 들어가지 않게 하기 위한 것 —
 * 이 모듈은 JSON을 직접 import 하지 않는다.
 */
export const createRegionLookup = (data: EncodedRegion[]) => {
  // 경계가 겹치는 지점에서는 더 작은 쪽이 이기도록 데이터가 넓이순으로 정렬돼 있다.
  const regions = data.map(decodeRegion);

  return (lng: number, lat: number): string | null => {
    for (const region of regions) {
      if (contains(region, lng, lat)) return region.name;
    }
    return nearest(regions, lng, lat);
  };
};
