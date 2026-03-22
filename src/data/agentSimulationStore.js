/** 데모: AI 고객 방치형 시뮬 — 2시간마다 고객 교체, 스킬 조건 충족 시에만 긍정 유치 진행 */

import { getSkillStep, SKILL_PROGRESS_MAX } from './agentSkillProgressStore';
import { getSkills } from './skillTreeStore';

export const CUSTOMER_ROTATION_MS = 2 * 60 * 60 * 1000;

export const AGENT_SIMULATION_CHANGED = 'you-agent-simulation-changed';

const STORAGE_POINTS = 'you-demo-simulation-points-v1';

function dispatchChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AGENT_SIMULATION_CHANGED));
}

export function getCustomerWindowId(now = Date.now()) {
  return Math.floor(now / CUSTOMER_ROTATION_MS);
}

export function getRotationRemainingMs(now = Date.now()) {
  const elapsed = now % CUSTOMER_ROTATION_MS;
  return CUSTOMER_ROTATION_MS - elapsed;
}

function hash32(n) {
  let h = (Number(n) >>> 0) ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 16), 0x21f0aaad);
  h = Math.imul(h ^ (h >>> 15), 0x735a2d97);
  return (h ^ (h >>> 15)) >>> 0;
}

/** @param {number[]} indices */
function seededShuffle(indices, seed) {
  const a = [...indices];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = hash32(s + i * 0x1a2b3c4d);
    const j = s % (i + 1);
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

const FAMILY_NAMES = [
  '김',
  '이',
  '박',
  '최',
  '정',
  '강',
  '조',
  '윤',
  '장',
  '임',
  '한',
  '오',
  '서',
  '신',
  '권',
  '황',
  '안',
  '송',
  '류',
  '홍',
];
const GIVEN_NAMES = [
  '민준',
  '서연',
  '도윤',
  '지우',
  '예준',
  '하은',
  '시우',
  '수아',
  '주원',
  '은채',
  '지호',
  '유진',
  '건우',
  '서윤',
  '현우',
  '채원',
  '우진',
  '다은',
  '선우',
  '지안',
];
const CONCERNS = [
  '인터넷 속도·단선에 대한 불만',
  'IPTV·약정 만료 후 요금 인상 우려',
  '가족 결합·요금제 변경 상담',
  '해지 방어 및 재약정 설득',
  '장애 접수 후 처리 지연에 대한 불만',
  '신규 가입 혜택과 기존 고객 차별 논의',
];
const GOALS = [
  '고객이 스스로 긍정적 결론을 말하며 마무리하기',
  '불만을 해소하고 재약정 또는 업셀에 동의받기',
  '감정을 누그러뜨리고 신뢰 회복 후 다음 액션 합의',
  '요금 구조를 이해시키고 이탈을 막기',
  '서비스 품질에 대한 기대를 현실적으로 맞추며 만족시키기',
];
const TONES = [
  '차분하지만 단호한 말투',
  '빠른 답변을 요구하는 성급한 톤',
  '반복 질문을 하는 신중한 성향',
  '유머로 분위기를 풀려 하는 편',
  '법적·약관 근거를 자주 언급하는 편',
];

const DIFFICULTY_LABELS = [
  '매우 쉬움',
  '쉬움',
  '보통',
  '어려움',
  '매우 어려움',
];

/**
 * @typedef {{ skillId: string, skillName: string, minStep: number }} SimulationSkillRequirement
 */

/**
 * 2시간 슬롯마다 동일 시드. 트리에 있는 스킬 중 1~3개에 대해 minStep(2~MAX) 요구.
 * @param {number} [now]
 */
export function generateAiCustomer(now = Date.now()) {
  const windowId = getCustomerWindowId(now);
  const h1 = hash32(windowId);
  const h2 = hash32(windowId + 1);
  const h3 = hash32(windowId + 2);
  const h4 = hash32(windowId + 3);
  const h5 = hash32(windowId + 404);
  const difficulty = (h1 % 5) + 1;
  const family = FAMILY_NAMES[h2 % FAMILY_NAMES.length];
  const given = GIVEN_NAMES[h3 % GIVEN_NAMES.length];
  const concern = CONCERNS[h4 % CONCERNS.length];
  const goal = GOALS[(h2 ^ h3) % GOALS.length];
  const tone = TONES[(h1 ^ h4) % TONES.length];

  const pool = typeof window === 'undefined' ? [] : getSkills();
  /** @type {SimulationSkillRequirement[]} */
  const requirements = [];
  if (pool.length) {
    const maxReq = Math.min(pool.length, 1 + (h5 % 3));
    const order = seededShuffle(
      pool.map((_, i) => i),
      h5
    );
    for (let i = 0; i < maxReq; i++) {
      const sk = pool[order[i]];
      const hx = hash32(h5 + i * 31);
      const floor = Math.min(difficulty, SKILL_PROGRESS_MAX - 1);
      const minStep = Math.min(
        SKILL_PROGRESS_MAX,
        Math.max(2, floor + (hx % 2))
      );
      requirements.push({
        skillId: sk.id,
        skillName: sk.name,
        minStep,
      });
    }
  }

  return {
    windowId,
    displayName: `${family}${given}`,
    concern,
    goal,
    tone,
    difficulty,
    difficultyLabel: DIFFICULTY_LABELS[difficulty - 1],
    requirements,
  };
}

/**
 * @param {SimulationSkillRequirement[]} requirements
 * @param {Record<string, number>} counts
 */
export function areSimulationRequirementsMet(requirements, counts) {
  if (!requirements.length) return true;
  return requirements.every(
    (r) => getSkillStep(r.skillId, counts) >= r.minStep
  );
}

export function getSimulationPoints() {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(STORAGE_POINTS);
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function addSimulationPoints(delta) {
  if (typeof window === 'undefined') return 0;
  const d = Math.floor(Number(delta) || 0);
  if (d <= 0) return getSimulationPoints();
  const next = getSimulationPoints() + d;
  window.localStorage.setItem(STORAGE_POINTS, String(next));
  dispatchChanged();
  return next;
}

export function formatRemainingShort(ms) {
  if (ms <= 0) return '0:00:00';
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
