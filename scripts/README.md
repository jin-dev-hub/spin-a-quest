# 시군구 경계 데이터 만들기

`src/data/municipalities.json`(295KB)을 다시 만들 때 쓰는 스크립트다.
좌표를 구 이름으로 바꾸는 데 외부 API 대신 이 데이터를 쓴다 (`src/lib/region.ts`).

원본 52MB는 커밋하지 않는다. 아래 순서대로 받아서 다시 만들면 된다.

## 다시 만들기

```bash
cd scripts

# 1. KOSTAT 2013 센서스용 행정구역경계 원본 (52MB, 커밋 안 함)
curl -sL -o muni_full.json \
  https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_municipalities_geo.json

# 2. 단순화 + 인코딩. 두 번째 인자는 최소 넓이(0이면 섬을 안 버린다)
python3 build-municipalities.py 0.0015 0

# 3. 결과 반영
cp municipalities.json ../src/data/municipalities.json
```

tolerance는 0.0015가 크기/정확도 균형점이다. 0.003으로 올리면 366KB에 94.9%로 떨어지고,
0.001로 낮추면 929KB인데 정확도는 98.8% 그대로라 커지기만 한다.

## 검증

실제 네이버 즐겨찾기 좌표를 주소와 대조해 정확도를 잰다.

```bash
# 공개 폴더 몇 개를 받아온다 (검증에 쓴 것들)
for ID in 9e33543c17774c039ac435d49f716f69 \
          5435402fef4945da94d48602bd96144e \
          fe1fa6f0d1bf4df3a628588a64a56210 \
          37874fe68eb04839885b36cdc02e0f81; do
  curl -s -A "Mozilla/5.0" \
    "https://pages.map.naver.com/save-pages/api/maps-bookmark/v3/shares/$ID/bookmarks" \
    -o /tmp/nb_$ID.json
done

python3 verify-municipalities.py
```

572곳 기준 98.8%가 나와야 한다. 남은 3건은 경계에 딱 붙은 2건과,
부산 주소인데 경기도 좌표가 박혀 있는 북마크 1건(원본 데이터 오류)이다.

## 주의할 점

**원본이 구 한국측지계라 WGS84와 어긋나 있다.** 그냥 쓰면 정확도가 90%에서 막히고
오차가 전부 북쪽으로 쏠린다. `build-municipalities.py`의 `DATUM_DLAT`/`DATUM_DLNG`가
그 보정값인데, 실제 즐겨찾기 좌표 254건으로 격자 탐색해서 구한 값이다(남북 311m, 동서 177m).
이걸 빼면 98.8% → 90%로 떨어진다. 부호는 경계를 옮기는 방향이라 질의점 기준과 반대다.

**2013년 자료라 그 뒤 바뀐 이름은 `RENAMED`에서 손으로 옮긴다.** 지금은 인천 남구 → 미추홀구
하나만 들어 있다. 행정구역이 더 바뀌면 여기에 추가하거나, 더 최신 경계 자료로 갈아타야 한다.

**라이선스** — KOSTAT 자료는 southkorea-maps 기준 "Free to share or remix".
같은 저장소의 GADM 자료는 재배포 금지라 쓰지 않았다.
