export type RegionGroup = "서울" | "수도권" | "대구" | "부산" | "대전";

export interface SubwayLine {
  id: string;
  name: string;
  color: string; // HSL string for branding
  regionGroup: RegionGroup; 
  stations: { name: string; region: RegionGroup }[];
}

export const subwayLines: SubwayLine[] = [
  // --- 서울 & 수도권 ---
  {
    id: "1",
    name: "1호선",
    color: "hsl(220, 80%, 40%)",
    regionGroup: "수도권",
    stations: [
      { name: "서울역", region: "서울" }, { name: "시청", region: "서울" }, { name: "종각", region: "서울" },
      { name: "종로3가", region: "서울" }, { name: "종로5가", region: "서울" }, { name: "동대문", region: "서울" },
      { name: "신설동", region: "서울" }, { name: "제기동", region: "서울" }, { name: "청량리", region: "서울" },
      { name: "회기", region: "서울" }, { name: "외대앞", region: "서울" }, { name: "신이문", region: "서울" },
      { name: "용산", region: "서울" }, { name: "남영", region: "서울" },
      { name: "구로", region: "서울" }, { name: "가산디지털단지", region: "서울" }, { name: "독산", region: "서울" },
      { name: "인천", region: "수도권" }, { name: "부평", region: "수도권" }, { name: "부천", region: "수도권" },
      { name: "소사", region: "수도권" }, { name: "역곡", region: "수도권" }, { name: "개봉", region: "수도권" },
      { name: "수원", region: "수도권" }, { name: "안양", region: "수도권" }, { name: "의왕", region: "수도권" },
    ],
  },
  {
    id: "2",
    name: "2호선",
    color: "hsl(130, 65%, 40%)",
    regionGroup: "수도권",
    stations: [
      { name: "시청", region: "서울" }, { name: "을지로입구", region: "서울" }, { name: "을지로3가", region: "서울" },
      { name: "을지로4가", region: "서울" }, { name: "동대문역사문화공원", region: "서울" },
      { name: "신당", region: "서울" }, { name: "상왕십리", region: "서울" }, { name: "왕십리", region: "서울" },
      { name: "한양대", region: "서울" }, { name: "뚝섬", region: "서울" }, { name: "성수", region: "서울" },
      { name: "건대입구", region: "서울" }, { name: "구의", region: "서울" }, { name: "강변", region: "서울" },
      { name: "잠실나루", region: "서울" }, { name: "잠실", region: "서울" }, { name: "잠실새내", region: "서울" },
      { name: "종합운동장", region: "서울" }, { name: "삼성", region: "서울" }, { name: "선릉", region: "서울" },
      { name: "역삼", region: "서울" }, { name: "강남", region: "서울" }, { name: "교대", region: "서울" },
      { name: "서초", region: "서울" }, { name: "방배", region: "서울" }, { name: "사당", region: "서울" },
      { name: "낙성대", region: "서울" }, { name: "서울대입구", region: "서울" }, { name: "봉천", region: "서울" },
      { name: "신림", region: "서울" }, { name: "신대방", region: "서울" }, { name: "구로디지털단지", region: "서울" },
      { name: "대림", region: "서울" }, { name: "신도림", region: "서울" }, { name: "문래", region: "서울" },
      { name: "영등포구청", region: "서울" }, { name: "당산", region: "서울" }, { name: "합정", region: "서울" },
      { name: "홍대입구", region: "서울" }, { name: "신촌", region: "서울" }, { name: "이대", region: "서울" },
      { name: "아현", region: "서울" }, { name: "충정로", region: "서울" },
    ],
  },
  {
    id: "3",
    name: "3호선",
    color: "hsl(25, 85%, 50%)",
    regionGroup: "수도권",
    stations: [
      { name: "지축", region: "서울" }, { name: "구파발", region: "서울" }, { name: "연신내", region: "서울" },
      { name: "불광", region: "서울" }, { name: "녹번", region: "서울" }, { name: "홍제", region: "서울" },
      { name: "무악재", region: "서울" }, { name: "독립문", region: "서울" }, { name: "경복궁", region: "서울" },
      { name: "안국", region: "서울" }, { name: "종로3가", region: "서울" }, { name: "을지로3가", region: "서울" },
      { name: "충무로", region: "서울" }, { name: "동대입구", region: "서울" }, { name: "약수", region: "서울" },
      { name: "금호", region: "서울" }, { name: "옥수", region: "서울" }, { name: "압구정", region: "서울" },
      { name: "신사", region: "서울" }, { name: "잠원", region: "서울" }, { name: "고속터미널", region: "서울" },
      { name: "교대", region: "서울" }, { name: "남부터미널", region: "서울" }, { name: "양재", region: "서울" },
      { name: "매봉", region: "서울" }, { name: "도곡", region: "서울" }, { name: "대치", region: "서울" },
      { name: "학여울", region: "서울" }, { name: "대청", region: "서울" }, { name: "일원", region: "서울" },
      { name: "수서", region: "서울" }, { name: "가락시장", region: "서울" }, { name: "경찰병원", region: "서울" },
      { name: "오금", region: "서울" },
    ],
  },
  {
    id: "4",
    name: "4호선",
    color: "hsl(200, 75%, 48%)",
    regionGroup: "수도권",
    stations: [
      { name: "당고개", region: "서울" }, { name: "상계", region: "서울" }, { name: "노원", region: "서울" },
      { name: "창동", region: "서울" }, { name: "쌍문", region: "서울" }, { name: "수유", region: "서울" },
      { name: "미아", region: "서울" }, { name: "미아사거리", region: "서울" }, { name: "성신여대입구", region: "서울" },
      { name: "한성대입구", region: "서울" }, { name: "혜화", region: "서울" }, { name: "동대문", region: "서울" },
      { name: "동대문역사문화공원", region: "서울" }, { name: "충무로", region: "서울" },
      { name: "명동", region: "서울" }, { name: "회현", region: "서울" }, { name: "서울역", region: "서울" },
      { name: "숙대입구", region: "서울" }, { name: "삼각지", region: "서울" }, { name: "신용산", region: "서울" },
      { name: "이촌", region: "서울" }, { name: "동작", region: "서울" }, { name: "총신대입구", region: "서울" },
      { name: "사당", region: "서울" },
      { name: "과천", region: "수도권" }, { name: "정부과천청사", region: "수도권" },
      { name: "인덕원", region: "수도권" }, { name: "평촌", region: "수도권" }, { name: "안산", region: "수도권" },
    ],
  },
  {
    id: "5",
    name: "5호선",
    color: "hsl(270, 55%, 50%)",
    regionGroup: "수도권",
    stations: [
      { name: "방화", region: "서울" }, { name: "개화산", region: "서울" }, { name: "김포공항", region: "서울" },
      { name: "송정", region: "서울" }, { name: "마곡", region: "서울" }, { name: "발산", region: "서울" },
      { name: "우장산", region: "서울" }, { name: "화곡", region: "서울" }, { name: "까치산", region: "서울" },
      { name: "신정", region: "서울" }, { name: "목동", region: "서울" }, { name: "오목교", region: "서울" },
      { name: "양평", region: "서울" }, { name: "영등포구청", region: "서울" }, { name: "영등포시장", region: "서울" },
      { name: "신길", region: "서울" }, { name: "여의도", region: "서울" }, { name: "여의나루", region: "서울" },
      { name: "마포", region: "서울" }, { name: "공덕", region: "서울" }, { name: "애오개", region: "서울" },
      { name: "충정로", region: "서울" }, { name: "서대문", region: "서울" }, { name: "광화문", region: "서울" },
      { name: "종로3가", region: "서울" }, { name: "을지로4가", region: "서울" }, { name: "동대문역사문화공원", region: "서울" },
      { name: "청구", region: "서울" }, { name: "신금호", region: "서울" }, { name: "행당", region: "서울" },
      { name: "왕십리", region: "서울" }, { name: "마장", region: "서울" }, { name: "답십리", region: "서울" },
      { name: "장한평", region: "서울" }, { name: "군자", region: "서울" }, { name: "아차산", region: "서울" },
      { name: "광나루", region: "서울" }, { name: "천호", region: "서울" }, { name: "강동", region: "서울" },
      { name: "길동", region: "서울" }, { name: "굽은다리", region: "서울" }, { name: "명일", region: "서울" },
      { name: "고덕", region: "서울" }, { name: "상일동", region: "서울" },
    ],
  },
  {
    id: "6",
    name: "6호선",
    color: "hsl(30, 60%, 45%)",
    regionGroup: "수도권",
    stations: [
      { name: "응암", region: "서울" }, { name: "역촌", region: "서울" }, { name: "불광", region: "서울" },
      { name: "독바위", region: "서울" }, { name: "연신내", region: "서울" }, { name: "구산", region: "서울" },
      { name: "새절", region: "서울" }, { name: "증산", region: "서울" }, { name: "디지털미디어시티", region: "서울" },
      { name: "월드컵경기장", region: "서울" }, { name: "마포구청", region: "서울" }, { name: "망원", region: "서울" },
      { name: "합정", region: "서울" }, { name: "상수", region: "서울" }, { name: "광흥창", region: "서울" },
      { name: "대흥", region: "서울" }, { name: "공덕", region: "서울" }, { name: "효창공원앞", region: "서울" },
      { name: "삼각지", region: "서울" }, { name: "녹사평", region: "서울" }, { name: "이태원", region: "서울" },
      { name: "한강진", region: "서울" }, { name: "버티고개", region: "서울" }, { name: "약수", region: "서울" },
      { name: "청구", region: "서울" }, { name: "신당", region: "서울" }, { name: "동묘앞", region: "서울" },
      { name: "창신", region: "서울" }, { name: "보문", region: "서울" }, { name: "안암", region: "서울" },
      { name: "고려대", region: "서울" }, { name: "월곡", region: "서울" }, { name: "상월곡", region: "서울" },
      { name: "돌곶이", region: "서울" }, { name: "석계", region: "서울" }, { name: "태릉입구", region: "서울" },
      { name: "화랑대", region: "서울" }, { name: "봉화산", region: "서울" },
    ],
  },
  {
    id: "7",
    name: "7호선",
    color: "hsl(80, 55%, 40%)",
    regionGroup: "수도권",
    stations: [
      { name: "장암", region: "서울" }, { name: "도봉산", region: "서울" }, { name: "수락산", region: "서울" },
      { name: "마들", region: "서울" }, { name: "노원", region: "서울" }, { name: "중계", region: "서울" },
      { name: "하계", region: "서울" }, { name: "공릉", region: "서울" }, { name: "태릉입구", region: "서울" },
      { name: "먹골", region: "서울" }, { name: "중화", region: "서울" }, { name: "상봉", region: "서울" },
      { name: "면목", region: "서울" }, { name: "사가정", region: "서울" }, { name: "용마산", region: "서울" },
      { name: "중곡", region: "서울" }, { name: "군자", region: "서울" }, { name: "어린이대공원", region: "서울" },
      { name: "건대입구", region: "서울" }, { name: "뚝섬유원지", region: "서울" }, { name: "청담", region: "서울" },
      { name: "강남구청", region: "서울" }, { name: "학동", region: "서울" }, { name: "논현", region: "서울" },
      { name: "반포", region: "서울" }, { name: "고속터미널", region: "서울" }, { name: "내방", region: "서울" },
      { name: "이수", region: "서울" }, { name: "남성", region: "서울" }, { name: "숭실대입구", region: "서울" },
      { name: "상도", region: "서울" }, { name: "장승배기", region: "서울" }, { name: "신대방삼거리", region: "서울" },
      { name: "보라매", region: "서울" }, { name: "신풍", region: "서울" }, { name: "대림", region: "서울" },
      { name: "남구로", region: "서울" }, { name: "가산디지털단지", region: "서울" },
      { name: "철산", region: "수도권" }, { name: "광명사거리", region: "수도권" },
    ],
  },
  {
    id: "8",
    name: "8호선",
    color: "hsl(340, 65%, 48%)",
    regionGroup: "수도권",
    stations: [
      { name: "암사", region: "서울" }, { name: "천호", region: "서울" }, { name: "강동구청", region: "서울" },
      { name: "몽촌토성", region: "서울" }, { name: "잠실", region: "서울" }, { name: "석촌", region: "서울" },
      { name: "송파", region: "서울" }, { name: "가락시장", region: "서울" }, { name: "문정", region: "서울" },
      { name: "장지", region: "서울" }, { name: "복정", region: "서울" },
      { name: "산성", region: "수도권" }, { name: "남한산성입구", region: "수도권" }, { name: "단대오거리", region: "수도권" },
      { name: "신흥", region: "수도권" }, { name: "수진", region: "수도권" }, { name: "모란", region: "수도권" },
    ],
  },
  {
    id: "9",
    name: "9호선",
    color: "hsl(42, 75%, 48%)",
    regionGroup: "수도권",
    stations: [
      { name: "개화", region: "서울" }, { name: "김포공항", region: "서울" }, { name: "공항시장", region: "서울" },
      { name: "신방화", region: "서울" }, { name: "마곡나루", region: "서울" }, { name: "양천향교", region: "서울" },
      { name: "가양", region: "서울" }, { name: "증미", region: "서울" }, { name: "등촌", region: "서울" },
      { name: "염창", region: "서울" }, { name: "신목동", region: "서울" }, { name: "선유도", region: "서울" },
      { name: "당산", region: "서울" }, { name: "국회의사당", region: "서울" }, { name: "여의도", region: "서울" },
      { name: "샛강", region: "서울" }, { name: "노량진", region: "서울" }, { name: "노들", region: "서울" },
      { name: "흑석", region: "서울" }, { name: "동작", region: "서울" }, { name: "구반포", region: "서울" },
      { name: "신반포", region: "서울" }, { name: "고속터미널", region: "서울" }, { name: "사평", region: "서울" },
      { name: "신논현", region: "서울" }, { name: "언주", region: "서울" }, { name: "선정릉", region: "서울" },
      { name: "삼성중앙", region: "서울" }, { name: "봉은사", region: "서울" }, { name: "종합운동장", region: "서울" },
      { name: "삼전", region: "서울" }, { name: "석촌고분", region: "서울" }, { name: "석촌", region: "서울" },
      { name: "송파나루", region: "서울" }, { name: "한성백제", region: "서울" }, { name: "올림픽공원", region: "서울" },
      { name: "둔촌오륜", region: "서울" }, { name: "중앙보훈병원", region: "서울" },
    ],
  },
  {
    id: "gyeongui",
    name: "경의중앙선",
    color: "hsl(175, 55%, 42%)",
    regionGroup: "수도권",
    stations: [
      { name: "서울역", region: "서울" }, { name: "공덕", region: "서울" }, { name: "홍대입구", region: "서울" },
      { name: "가좌", region: "서울" }, { name: "디지털미디어시티", region: "서울" },
      { name: "용산", region: "서울" }, { name: "이촌", region: "서울" }, { name: "옥수", region: "서울" },
      { name: "왕십리", region: "서울" }, { name: "청량리", region: "서울" }, { name: "회기", region: "서울" },
      { name: "중랑", region: "서울" },
      { name: "일산", region: "수도권" }, { name: "탄현", region: "수도권" }, { name: "파주", region: "수도권" },
      { name: "문산", region: "수도권" }, { name: "금촌", region: "수도권" },
      { name: "덕소", region: "수도권" }, { name: "양평", region: "수도권" }, { name: "용문", region: "수도권" },
    ],
  },
  {
    id: "shinbundang",
    name: "신분당선",
    color: "hsl(350, 75%, 50%)",
    regionGroup: "수도권",
    stations: [
      { name: "강남", region: "서울" }, { name: "양재", region: "서울" }, { name: "양재시민의숲", region: "서울" },
      { name: "청계산입구", region: "서울" },
      { name: "판교", region: "수도권" }, { name: "정자", region: "수도권" },
      { name: "미금", region: "수도권" }, { name: "동천", region: "수도권" },
      { name: "수지구청", region: "수도권" }, { name: "성복", region: "수도권" },
      { name: "상현", region: "수도권" }, { name: "광교", region: "수도권" }, { name: "광교중앙", region: "수도권" },
      { name: "신사", region: "서울" },
    ],
  },

  // --- 대구 ---
  {
    id: "daegu-1",
    name: "대구 1호선",
    color: "hsl(0, 100%, 40%)", // 빨간색
    regionGroup: "대구",
    stations: [
      { name: "설화명곡", region: "대구" }, { name: "화원", region: "대구" }, { name: "대곡", region: "대구" },
      { name: "진천", region: "대구" }, { name: "상인", region: "대구" }, { name: "성당못", region: "대구" },
      { name: "영대병원", region: "대구" }, { name: "명덕", region: "대구" }, { name: "반월당", region: "대구" },
      { name: "중앙로", region: "대구" }, { name: "대구역", region: "대구" }, { name: "동대구역", region: "대구" },
      { name: "아양교", region: "대구" }, { name: "신기", region: "대구" }, { name: "안심", region: "대구" },
    ],
  },
  {
    id: "daegu-2",
    name: "대구 2호선",
    color: "hsl(100, 100%, 35%)", // 초록색
    regionGroup: "대구",
    stations: [
      { name: "문양", region: "대구" }, { name: "다사", region: "대구" }, { name: "계명대", region: "대구" },
      { name: "성서산업단지", region: "대구" }, { name: "용산", region: "대구" }, { name: "죽전", region: "대구" },
      { name: "두류", region: "대구" }, { name: "반고개", region: "대구" }, { name: "청라언덕", region: "대구" },
      { name: "반월당", region: "대구" }, { name: "경대병원", region: "대구" }, { name: "범어", region: "대구" },
      { name: "만촌", region: "대구" }, { name: "담티", region: "대구" }, { name: "대공원", region: "대구" },
      { name: "사월", region: "대구" }, { name: "정평", region: "대구" }, { name: "임당", region: "대구" },
      { name: "영남대", region: "대구" },
    ],
  },
  {
    id: "daegu-3",
    name: "대구 3호선",
    color: "hsl(45, 100%, 50%)", // 노란색
    regionGroup: "대구",
    stations: [
      { name: "칠곡경대병원", region: "대구" }, { name: "팔거", region: "대구" }, { name: "칠곡운암", region: "대구" },
      { name: "매천", region: "대구" }, { name: "팔달", region: "대구" }, { name: "공단", region: "대구" },
      { name: "팔달시장", region: "대구" }, { name: "원대", region: "대구" }, { name: "북구청", region: "대구" },
      { name: "달성공원", region: "대구" }, { name: "서문시장", region: "대구" }, { name: "청라언덕", region: "대구" },
      { name: "남산", region: "대구" }, { name: "명덕", region: "대구" }, { name: "건들바위", region: "대구" },
      { name: "대봉교", region: "대구" }, { name: "수성시장", region: "대구" }, { name: "어린이세상", region: "대구" },
      { name: "황금", region: "대구" }, { name: "수성못", region: "대구" }, { name: "지산", region: "대구" },
      { name: "범물", region: "대구" }, { name: "용지", region: "대구" },
    ],
  },
  // --- 대구 4호선 (계획 - 엑스코선) ---
  // {
  //   id: "daegu-4",
  //   name: "대구 4호선(예정)",
  //   color: "hsl(200, 100%, 40%)", // 하늘색 계열
  //   regionGroup: "대구",
  //   stations: [
  //     { name: "수성구민운동장", region: "대구" }, { name: "범어", region: "대구" }, { name: "MBC네거리", region: "대구" },
  //     { name: "동대구역", region: "대구" }, { name: "파티마병원", region: "대구" }, { name: "경북대", region: "대구" },
  //     { name: "엑스코", region: "대구" }, { name: "금호워터폴리스", region: "대구" }, { name: "이시아폴리스", region: "대구" },
  //   ],
  // },
  // // --- 대구 5호선 (계획 - 순환선) ---
  // {
  //   id: "daegu-5",
  //   name: "대구 5호선(예정)",
  //   color: "hsl(280, 50%, 45%)", // 보라색 계열
  //   regionGroup: "대구",
  //   stations: [
  //     { name: "서대구역", region: "대구" }, { name: "평리", region: "대구" }, { name: "두류", region: "대구" },
  //     { name: "안지랑", region: "대구" }, { name: "현충로", region: "대구" }, { name: "영대병원", region: "대구" },
  //     { name: "희망교", region: "대구" }, { name: "황금", region: "대구" }, { name: "만촌", region: "대구" },
  //     { name: "동구청", region: "대구" }, { name: "복현", region: "대구" }, { name: "노원", region: "대구" },
  //     { name: "만평", region: "대구" },
  //   ],
  // },

  // --- 부산 ---
  {
    id: "busan-1",
    name: "부산 1호선",
    color: "hsl(20, 90%, 50%)", // 주황색
    regionGroup: "부산",
    stations: [
      { name: "다대포해수욕장", region: "부산" }, { name: "신평", region: "부산" }, { name: "하단", region: "부산" },
      { name: "남포", region: "부산" }, { name: "중앙", region: "부산" }, { name: "부산역", region: "부산" },
      { name: "초량", region: "부산" }, { name: "서면", region: "부산" }, { name: "부전", region: "부산" },
      { name: "양정", region: "부산" }, { name: "시청", region: "부산" }, { name: "연산", region: "부산" },
      { name: "동래", region: "부산" }, { name: "명륜", region: "부산" }, { name: "온천장", region: "부산" },
      { name: "부산대", region: "부산" }, { name: "구서", region: "부산" }, { name: "노포", region: "부산" },
    ],
  },
  {
    id: "busan-2",
    name: "부산 2호선",
    color: "hsl(100, 60%, 45%)", // 연두색
    regionGroup: "부산",
    stations: [
      { name: "장산", region: "부산" }, { name: "중동", region: "부산" }, { name: "해운대", region: "부산" },
      { name: "벡스코", region: "부산" }, { name: "센텀시티", region: "부산" }, { name: "민락", region: "부산" },
      { name: "수영", region: "부산" }, { name: "광안", region: "부산" }, { name: "경성대부경대", region: "부산" },
      { name: "대연", region: "부산" }, { name: "문현", region: "부산" }, { name: "전포", region: "부산" },
      { name: "서면", region: "부산" }, { name: "가야", region: "부산" }, { name: "주례", region: "부산" },
      { name: "사상", region: "부산" }, { name: "덕천", region: "부산" }, { name: "호포", region: "부산" },
      { name: "양산", region: "부산" },
    ],
  },
  {
    id: "busan-3",
    name: "부산 3호선",
    color: "hsl(35, 80%, 45%)", // 고동색계열 주황
    regionGroup: "부산",
    stations: [
      { name: "수영", region: "부산" }, { name: "망미", region: "부산" }, { name: "배산", region: "부산" },
      { name: "연산", region: "부산" }, { name: "거제", region: "부산" }, { name: "종합운동장", region: "부산" },
      { name: "사직", region: "부산" }, { name: "미남", region: "부산" }, { name: "만덕", region: "부산" },
      { name: "덕천", region: "부산" }, { name: "구포", region: "부산" }, { name: "강서구청", region: "부산" },
      { name: "대저", region: "부산" },
    ],
  },
  {
    id: "busan-4",
    name: "부산 4호선",
    color: "hsl(200, 80%, 40%)", // 파란색
    regionGroup: "부산",
    stations: [
      { name: "미남", region: "부산" }, { name: "동래", region: "부산" }, { name: "수안", region: "부산" },
      { name: "낙민", region: "부산" }, { name: "충렬사", region: "부산" }, { name: "명장", region: "부산" },
      { name: "서동", region: "부산" }, { name: "금사", region: "부산" }, { name: "농산물시장", region: "부산" },
      { name: "석대", region: "부산" }, { name: "영산대", region: "부산" }, { name: "윗반송", region: "부산" },
      { name: "고촌", region: "부산" }, { name: "안평", region: "부산" },
    ],
  },
  {
    id: "donghae",
    name: "동해선",
    color: "hsl(210, 90%, 55%)", // 밝은 파란색
    regionGroup: "부산",
    stations: [
      { name: "부전", region: "부산" }, { name: "거제해맞이", region: "부산" }, { name: "거제", region: "부산" },
      { name: "교대", region: "부산" }, { name: "동래", region: "부산" }, { name: "안락", region: "부산" },
      { name: "부산원동", region: "부산" }, { name: "재송", region: "부산" }, { name: "센텀", region: "부산" },
      { name: "벡스코", region: "부산" }, { name: "신해운대", region: "부산" }, { name: "송정", region: "부산" },
      { name: "오시리아", region: "부산" }, { name: "기장", region: "부산" }, { name: "일광", region: "부산" },
      { name: "태화강", region: "부산" },
    ],
  },
  {
    id: "gimhae",
    name: "김해경전철",
    color: "hsl(140, 50%, 45%)", // 녹색
    regionGroup: "부산",
    stations: [
      { name: "사상", region: "부산" }, { name: "괘법르네시떼", region: "부산" }, { name: "공항", region: "부산" },
      { name: "덕두", region: "부산" }, { name: "대저", region: "부산" }, { name: "평강", region: "부산" },
      { name: "대사", region: "부산" }, { name: "불암", region: "부산" }, { name: "지내", region: "부산" },
      { name: "김해시청", region: "부산" }, { name: "박물관", region: "부산" }, { name: "연지공원", region: "부산" },
      { name: "가야대", region: "부산" },
    ],
  },

  // --- 대전 ---
  {
    id: "daejeon-1",
    name: "대전 1호선",
    color: "hsl(120, 60%, 35%)", // 진녹색
    regionGroup: "대전",
    stations: [
      { name: "판암", region: "대전" }, { name: "신흥", region: "대전" }, { name: "대동", region: "대전" },
      { name: "대전역", region: "대전" }, { name: "중앙로", region: "대전" }, { name: "중구청", region: "대전" },
      { name: "서대전네거리", region: "대전" }, { name: "오룡", region: "대전" }, { name: "용문", region: "대전" },
      { name: "탄방", region: "대전" }, { name: "시청", region: "대전" }, { name: "정부청사", region: "대전" },
      { name: "갈마", region: "대전" }, { name: "월평", region: "대전" }, { name: "갑천", region: "대전" },
      { name: "유성온천", region: "대전" }, { name: "구암", region: "대전" }, { name: "현충원", region: "대전" },
      { name: "노은", region: "대전" }, { name: "지족", region: "대전" }, { name: "반석", region: "대전" },
    ],
  },
];

export const foodPresets = [
  "한식", "중식", "일식", "양식",
];

export const activityPresets = [
  "방탈출", "보드게임", "영화관", "코인노래방", "산책", "전시회", "팝업스토어", "실내스포츠", "카페", "쇼핑"
];