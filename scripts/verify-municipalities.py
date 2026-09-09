"""단순화한 경계로 실제 즐겨찾기 좌표를 판정해 주소와 대조한다."""

import glob
import json
import re

SCALE = 1e4
SIDO = re.compile(r"^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)")


def decode_ring(encoded):
    """빌드 결과는 1/10000도 정수의 차이값이라 원래 좌표로 되돌려서 쓴다."""
    out = []
    x = y = 0
    for i in range(0, len(encoded), 2):
        x += encoded[i]
        y += encoded[i + 1]
        out.extend((x / SCALE, y / SCALE))
    return out


muni = [
    [name, [v / SCALE for v in bbox], [decode_ring(r) for r in rings]]
    for name, bbox, rings in json.load(open("municipalities.json"))
]


def inside(ring, x, y):
    n = len(ring) // 2
    crossing = False
    j = n - 1
    for i in range(n):
        xi, yi = ring[2 * i], ring[2 * i + 1]
        xj, yj = ring[2 * j], ring[2 * j + 1]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            crossing = not crossing
        j = i
    return crossing


def lookup(lng, lat):
    for name, (a, b, c, d), rings in muni:  # 작은 순으로 정렬돼 있어 첫 매치가 가장 구체적이다
        if not (a <= lng <= c and b <= lat <= d):
            continue
        if sum(1 for r in rings if inside(r, lng, lat)) % 2 == 1:
            return name
    return None


ok = wrong = 0
bad = []
for path in glob.glob("/tmp/nb_*.json"):
    for bookmark in json.load(open(path))["bookmarkList"]:
        address = (bookmark.get("address") or "").strip()
        tokens = address.split()
        if len(tokens) < 2 or not SIDO.match(tokens[0]):
            continue
        # "경기 수원시 팔달구 ..." 처럼 구까지 있으면 구를, 없으면 시/군을 기대값으로 삼는다
        expected = None
        for token in tokens[1:3]:
            if re.match(r"^[가-힣]+[구군]$", token):
                expected = token
                break
        if not expected:
            expected = next((t for t in tokens[1:2] if t.endswith("시")), None)
        if not expected:
            continue

        got = lookup(bookmark["px"], bookmark["py"])
        if got and got.split()[-1] == expected:
            ok += 1
        else:
            wrong += 1
            bad.append((got, expected, address[:38]))

print(f"일치 {ok}/{ok + wrong} ({ok * 100 / (ok + wrong):.1f}%)")
for row in bad:
    print("    판정=%-12s 기대=%-8s %s" % row)
