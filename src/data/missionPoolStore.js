/** 데모: 미션 풀. 실서비스는 API로 대체. */

import { getSkills, skillNameMap } from './skillTreeStore';

const STORAGE_KEY = 'you-demo-mission-pool-v1';

export const MISSION_POOL_CHANGED = 'you-mission-pool-changed';

const DEFAULT_POOL = [
  {
    id: 'pool-1',
    title: '동료 우수콜 3건 응원',
    difficulty: '쉬움',
    points: 100,
    skillIds: ['skill-empathy'],
  },
  {
    id: 'pool-2',
    title: '묶음 상품 포함 콜 신청',
    difficulty: '보통',
    points: 150,
    skillIds: ['skill-product', 'skill-cross'],
  },
  {
    id: 'pool-3',
    title: '해지 방어 콜 신청',
    difficulty: '도전',
    points: 250,
    skillIds: ['skill-closing', 'skill-empathy', 'skill-vip'],
  },
];

function safeParse(raw) {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

export function getMissionPool() {
  if (typeof window === 'undefined') return DEFAULT_POOL.map((m) => ({ ...m }));
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_POOL.map((m) => ({ ...m }));
  const parsed = safeParse(raw);
  if (!parsed?.length) return DEFAULT_POOL.map((m) => ({ ...m }));
  return parsed;
}

export function saveMissionPool(rows) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new CustomEvent(MISSION_POOL_CHANGED));
}

export function addMissionToPool({ title, difficulty, points, skillIds }) {
  const trimmed = title?.trim();
  if (!trimmed) return null;
  const pool = getMissionPool();
  const id = `pool-${Date.now().toString(36)}`;
  const next = [
    ...pool,
    {
      id,
      title: trimmed,
      difficulty: difficulty || '보통',
      points: Number(points) || 0,
      skillIds: Array.isArray(skillIds) ? [...skillIds] : [],
    },
  ];
  saveMissionPool(next);
  return id;
}

/** 풀 행에 스킬 이름 붙이기 */
export function resolvePoolRowSkills(row) {
  const map = skillNameMap(getSkills());
  return {
    ...row,
    linkedSkills: (row.skillIds || []).map((id) => ({
      id,
      name: map[id] ?? id,
    })),
  };
}
