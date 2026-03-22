import { getSkills, skillNameMap } from './skillTreeStore';

/** 오늘의 미션 정의 (스킬 id 다중). 이름은 현재 트리에서 해석 */
export const TODAY_MISSION_DEFS = [
  {
    id: 'm-open',
    title: '첫 인사 30초 안에 고객 호칭·용건을 한 문장으로 확인하기',
    hint: '오프닝에서 신뢰와 리듬을 잡는 연습',
    skillIds: ['skill-foundation', 'skill-empathy'],
  },
  {
    id: 'm-multi',
    title: '불만이 두 가지 이상일 때, 우선순위를 고객에게 한 번만 물어보고 정리하기',
    hint: '복합 문의를 구조화하는 미션',
    skillIds: ['skill-empathy', 'skill-product'],
  },
  {
    id: 'm-close',
    title: '통화 마무리 전, 다음 조치(일시·방법)를 말로 다시 한 번 확약하기',
    hint: '클로징에서 기대치를 맞추기',
    skillIds: ['skill-closing', 'skill-foundation'],
  },
];

export function getResolvedTodayMissions() {
  const map = skillNameMap(getSkills());
  return TODAY_MISSION_DEFS.map((m) => ({
    id: m.id,
    title: m.title,
    hint: m.hint,
    linkedSkills: (m.skillIds || []).map((id) => ({
      id,
      name: map[id] ?? id,
    })),
  }));
}
