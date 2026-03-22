/** 데모: 스킬별 단계(0~5). 미션 1회 완료 시 연결 스킬 +1. 실서비스는 API로 대체. */

export const SKILL_PROGRESS_MAX = 5;

const STORAGE_KEY = 'you-demo-agent-skill-progress-v2';

export const AGENT_SKILL_PROGRESS_CHANGED = 'you-agent-skill-progress-changed';

/** @type {{ counts: Record<string, number>, recommendedIds: string[] }} */
const DEFAULT_STATE = {
  counts: {},
  recommendedIds: ['skill-product'],
};

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clampStep(n) {
  const x = Math.floor(Number(n) || 0);
  return Math.min(SKILL_PROGRESS_MAX, Math.max(0, x));
}

export function getSkillProgressState() {
  if (typeof window === 'undefined') {
    return {
      counts: { ...DEFAULT_STATE.counts },
      recommendedIds: [...DEFAULT_STATE.recommendedIds],
    };
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      counts: { ...DEFAULT_STATE.counts },
      recommendedIds: [...DEFAULT_STATE.recommendedIds],
    };
  }
  const p = safeParse(raw);
  if (!p || typeof p !== 'object') {
    return {
      counts: { ...DEFAULT_STATE.counts },
      recommendedIds: [...DEFAULT_STATE.recommendedIds],
    };
  }
  const counts =
    p.counts && typeof p.counts === 'object' ? { ...p.counts } : {};
  for (const k of Object.keys(counts)) {
    counts[k] = clampStep(counts[k]);
  }
  return {
    counts,
    recommendedIds: Array.isArray(p.recommendedIds) ? p.recommendedIds : [],
  };
}

function saveSkillProgressState(state) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 2,
      counts: state.counts,
      recommendedIds: state.recommendedIds,
    })
  );
  window.dispatchEvent(new CustomEvent(AGENT_SKILL_PROGRESS_CHANGED));
}

/** 트리에 있는 스킬 id만 대상으로 현재 단계 (없으면 0) */
export function getSkillStep(skillId, counts) {
  return clampStep(counts[skillId]);
}

/**
 * 연결 스킬 단계를 delta만큼 조정 (미션 체크 on/off).
 * @param {string[]} skillIds
 * @param {number} delta +1 | -1
 */
export function adjustSkillStepsForMission(skillIds, delta) {
  if (!skillIds?.length || !delta) return;
  const state = getSkillProgressState();
  const nextCounts = { ...state.counts };
  for (const id of skillIds) {
    if (!id) continue;
    const cur = clampStep(nextCounts[id] ?? 0);
    nextCounts[id] = clampStep(cur + delta);
  }
  saveSkillProgressState({
    counts: nextCounts,
    recommendedIds: state.recommendedIds,
  });
}

/** @deprecated 호환용 — 기존 import 제거 전까지 */
export function getSkillProgress() {
  return getSkillProgressState();
}
