"""KOSTAT 2013 시군구 경계 -> 앱에서 쓸 최소 경계 데이터.

- Douglas-Peucker로 점을 줄인다.
- 원본이 구 한국측지계라 WGS84와 어긋나 있어서, 실측으로 구한 보정값을 좌표에 미리 더해둔다.
- 라벨은 구 이름만 쓰되, 전국에서 겹치는 이름(중구·동구...)만 상위 지역을 붙인다.

사용: python3 simplify.py <tolerance> [min_area]
"""

import json
import re
import sys
from collections import Counter

PROVINCE = {
    "11": "서울", "21": "부산", "22": "대구", "23": "인천", "24": "광주",
    "25": "대전", "26": "울산", "29": "세종", "31": "경기", "32": "강원",
    "33": "충북", "34": "충남", "35": "전북", "36": "전남", "37": "경북",
    "38": "경남", "39": "제주",
}

# 2013년 기준 자료라 그 뒤 바뀐 이름은 지금 이름으로 옮긴다.
RENAMED = {"남구": {"23": "미추홀구"}}

# 실제 즐겨찾기 좌표로 격자 탐색해 얻은 보정값. 질의점 기준 (+0.0020, -0.0028) 이므로
# 경계 쪽에는 반대 부호로 적용한다. 약 남북 311m, 동서 177m.
DATUM_DLAT = 0.0028
DATUM_DLNG = -0.0020

TOLERANCE = float(sys.argv[1])
MIN_AREA = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
PRECISION = 4


def perpendicular(point, start, end):
    (x, y), (x1, y1), (x2, y2) = point, start, end
    dx, dy = x2 - x1, y2 - y1
    if dx == 0 and dy == 0:
        return ((x - x1) ** 2 + (y - y1) ** 2) ** 0.5
    t = max(0.0, min(1.0, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
    return ((x - (x1 + t * dx)) ** 2 + (y - (y1 + t * dy)) ** 2) ** 0.5


def douglas_peucker(points, tolerance):
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        first, last = stack.pop()
        worst, index = 0.0, -1
        for i in range(first + 1, last):
            d = perpendicular(points[i], points[first], points[last])
            if d > worst:
                worst, index = d, i
        if worst > tolerance:
            keep[index] = True
            stack.append((first, index))
            stack.append((index, last))
    return [p for p, k in zip(points, keep) if k]


def ring_area(points):
    total = 0.0
    for i in range(len(points)):
        x1, y1 = points[i]
        x2, y2 = points[(i + 1) % len(points)]
        total += x1 * y2 - x2 * y1
    return abs(total) / 2


src = json.load(open("muni_full.json"))
features = src["features"]


def base_name(props):
    name = props["name"]
    renamed = RENAMED.get(name, {}).get(props["code"][:2])
    if renamed:
        return renamed
    # 고양시덕양구 -> 덕양구, 서귀포시 -> 서귀포시
    match = re.match(r"^(\S+시)(\S+구)$", name)
    return match.group(2) if match else name


bases = Counter(base_name(f["properties"]) for f in features)


def label(props):
    base = base_name(props)
    if bases[base] == 1:
        return base
    # 겹치는 이름이면 상위 지역을 붙인다. 수원시 팔달구 / 서울 중구
    match = re.match(r"^(\S+시)(\S+구)$", props["name"])
    prefix = match.group(1) if match else PROVINCE.get(props["code"][:2], "")
    return f"{prefix} {base}".strip()


result = []
for feature in features:
    geometry = feature["geometry"]
    raw_rings = (
        geometry["coordinates"]
        if geometry["type"] == "Polygon"
        else [ring for polygon in geometry["coordinates"] for ring in polygon]
    )

    rings = []
    for raw in raw_rings:
        points = [
            (round(x + DATUM_DLNG, PRECISION), round(y + DATUM_DLAT, PRECISION)) for x, y in raw
        ]
        deduped = [p for i, p in enumerate(points) if i == 0 or p != points[i - 1]]
        if ring_area(deduped) < MIN_AREA:
            continue
        simplified = douglas_peucker(deduped, TOLERANCE)
        if len(simplified) >= 4:
            rings.append([c for p in simplified for c in p])

    if not rings:
        continue

    lngs = [r[i] for r in rings for i in range(0, len(r), 2)]
    lats = [r[i] for r in rings for i in range(1, len(r), 2)]
    area = sum(ring_area(list(zip(r[0::2], r[1::2]))) for r in rings)
    result.append(
        {
            "name": label(feature["properties"]),
            "bbox": [min(lngs), min(lats), max(lngs), max(lats)],
            "area": round(area, 6),
            "rings": rings,
        }
    )

# 겹치는 판정이 나오면 작은 쪽이 이기도록 미리 정렬해둔다.
result.sort(key=lambda r: r["area"])
compact = [[r["name"], r["bbox"], r["rings"]] for r in result]



def encode_ring(ring):
    """좌표를 1/10000도 정수로 바꾼 뒤 앞 점과의 차이만 남긴다. 파일이 절반 이하로 줄어든다."""
    out = []
    prev_x = prev_y = 0
    for i in range(0, len(ring), 2):
        x, y = round(ring[i] * 1e4), round(ring[i + 1] * 1e4)
        out.append(x - prev_x)
        out.append(y - prev_y)
        prev_x, prev_y = x, y
    return out


encoded = [
    [name, [round(v * 1e4) for v in bbox], [encode_ring(r) for r in rings]]
    for name, bbox, rings in compact
]

text = json.dumps(encoded, ensure_ascii=False, separators=(",", ":"))
open("municipalities.json", "w", encoding="utf-8").write(text)
points = sum(len(r) // 2 for _, _, rings in compact for r in rings)
print(f"tol={TOLERANCE} 시군구={len(encoded)} 점={points} 크기={len(text.encode())/1024:.0f}KB")
