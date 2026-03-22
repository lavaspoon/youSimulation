/** 데모: 연도별 월(1–12) 선정 건수 */
export const SELECTION_COUNT_BY_YEAR = {
  2024: {
    1: 1,
    2: 0,
    3: 2,
    4: 1,
    5: 0,
    6: 1,
    7: 2,
    8: 0,
    9: 1,
    10: 1,
    11: 0,
    12: 0,
  },
  2025: {
    1: 1,
    2: 1,
    3: 2,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
  },
};

export const CHART_YEAR_MIN = 2024;
export const CHART_YEAR_MAX = 2025;

/**
 * @param {number} year
 * @returns {{ month: number, count: number, label: string, monthLabel: string }[]}
 */
export function buildYearChartSeries(year) {
  const row = SELECTION_COUNT_BY_YEAR[year] || {};
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const count = row[month] ?? 0;
    return {
      month,
      count,
      label: `${month}월`,
      monthLabel: `${year}년 ${month}월`,
    };
  });
}

/** @typedef {{ id: string, date: string, titleShort: string, product: string, status: 'selected'|'not_selected', registered: { situation: string, reaction: string, action: string }, whySelected?: string, whyNotSelected?: string }} HistoryItem */

/** @type {{ year: number, month: number, items: HistoryItem[] }[]} */
export const HISTORY_BLOCKS = [
  {
    year: 2025,
    month: 3,
    items: [
      {
        id: 'm3-1',
        date: '2025-03-18',
        titleShort: '해지 의사 고객 장기 유지',
        product: '인터넷',
        status: 'selected',
        registered: {
          situation:
            '2년 차 인터넷 고객이 요금 인상에 불만을 표하며 해지를 요구함.',
          reaction:
            '처음에는 강한 톤이었으나 요금 구조 설명 후 톤이 누그러짐.',
          action:
            '할인 프로모션·약정 연장 혜택을 비교표로 안내하고 익일 확인 콜로 마무리.',
        },
        whySelected:
          '고객 감정 전환 과정이 신청 서술에 구체적으로 드러나고, 해지 방어에 실질적 대안(약정·할인) 제시가 확인되었습니다. AI·심사 기준상 우수콜로 판단되었습니다.',
      },
      {
        id: 'm3-2',
        date: '2025-03-05',
        titleShort: '복합 불만 클로징',
        product: '인터넷+BTV',
        status: 'selected',
        registered: {
          situation: '인터넷 속도와 BTV 채널 구성을 동시에 문제 삼는 복합 문의.',
          reaction: '여러 번 통화 끊김 후 재인입, 끝까지 청취 요구.',
          action:
            '원인 구분(회선 vs 단말) 안내 후 방문 기사 예약·채널 패키지 변경 제안.',
        },
        whySelected:
          '복합 이슈를 단계별로 정리한 점, 고객이 원하는 ‘원인 설명’과 ‘실행 가능한 조치’가 균형 있게 서술되었습니다.',
      },
      {
        id: 'm3-3',
        date: '2025-03-01',
        titleShort: '단순 요금 문의',
        product: '인터넷',
        status: 'not_selected',
        registered: {
          situation: '명세서 금액이 평소와 달라 문의.',
          reaction: '설명 후 특별한 불만 없이 통화 종료.',
          action: '항목별 요금 안내 및 다음 달 예상 금액 안내.',
        },
        whyNotSelected:
          '정중한 안내는 확인되나, 우수콜로 인정하기엔 난이도·특색이 낮고 기존 다수 승인 사례와 유사한 일반 문의에 가깝다고 판단되었습니다.',
      },
      {
        id: 'm3-4',
        date: '2025-03-12',
        titleShort: '기기 교체 상담 완료',
        product: '인터넷',
        status: 'selected',
        registered: {
          situation: '노후 단말로 속도 저하를 호소하는 장기 고객.',
          reaction: '비용 부담을 우려하며 즉시 결정은 어렵다고 함.',
          action:
            '임대·구매 옵션 비교표를 보내드리고 익일 콜백으로 결정 지원.',
        },
        whySelected:
          '비용 민감 고객에게 선택지를 구조화해 제시한 점이 서술에 잘 드러납니다.',
      },
      {
        id: 'm3-5',
        date: '2025-03-08',
        titleShort: '약정 만료 전 요금 안내',
        product: 'BTV',
        status: 'not_selected',
        registered: {
          situation: '약정 만료 월에 요금 변동 안내 요청.',
          reaction: '타 채널 요금과 비교 질문.',
          action: '만료 후 표준 요금·할인 가능 구간을 일자 기준으로 안내.',
        },
        whyNotSelected:
          '안내는 정확하나 우수사례로 공유할 만한 난이도·특색은 제한적입니다.',
      },
    ],
  },
  {
    year: 2025,
    month: 2,
    items: [
      {
        id: 'm2-1',
        date: '2025-02-22',
        titleShort: '약정 승계·혜택 안내',
        product: 'BTV',
        status: 'selected',
        registered: {
          situation: '타사 이전 검토 중인 고객에게 승계 조건 문의.',
          reaction: '경쟁사 요금과 비교 질문 다수.',
          action:
            '승계 시 유지 혜택·위약금 구조를 표로 정리해 문자 발송 후 동의.',
        },
        whySelected:
          '경쟁 대응 상황에서 자료 기반 설명과 후속 문자로 신뢰 확보 흐름이 명확합니다.',
      },
    ],
  },
  {
    year: 2025,
    month: 1,
    items: [
      {
        id: 'm1-1',
        date: '2025-01-14',
        titleShort: '요금 이의·상세 설명',
        product: '인터넷',
        status: 'not_selected',
        registered: {
          situation: '부가서비스 과금에 대한 이의.',
          reaction: '납부 확인 후 이해.',
          action: '가입 경로 확인 후 해지·환불 가능 구간 안내.',
        },
        whyNotSelected:
          '이의 처리는 적절하나, 우수사례 공유 가치(교육·벤치마크)는 제한적이라 이번 분기 미선정으로 처리했습니다.',
      },
    ],
  },
  {
    year: 2024,
    month: 12,
    items: [],
  },
  {
    year: 2024,
    month: 6,
    items: [
      {
        id: 'y24-6-1',
        date: '2024-06-20',
        titleShort: '장마철 회선 점검 안내',
        product: '인터넷',
        status: 'selected',
        registered: {
          situation: '빗날 끊김 다발 구간 거주 고객.',
          reaction: '기사 방문 일정 조율 요청.',
          action: '외선 상태 확인 예약 및 결과 문자 안내.',
        },
        whySelected:
          '기상 이슈에 대한 선제 안내와 일정 조율이 구체적으로 기술되었습니다.',
      },
    ],
  },
];

/**
 * @param {number} year
 * @param {number} month
 */
export function findHistoryBlock(year, month) {
  const b = HISTORY_BLOCKS.find((x) => x.year === year && x.month === month);
  return b ?? { year, month, items: [] };
}

