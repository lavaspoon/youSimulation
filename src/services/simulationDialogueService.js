/**
 * 시뮬레이션 예시 대화 (API 미연동): 고객 → 상담사(내 캐릭) → 고객 3턴 후 긍정/비긍정 판정
 */

import {
  getSkillStep,
  SKILL_PROGRESS_MAX,
} from '../data/agentSkillProgressStore';
import { resolveSkillSummary } from '../data/skillTreeStore';

/** @typedef {{ displayName: string, concern: string, goal: string, tone: string, difficulty: number }} SimCustomer */
/** @typedef {{ role: 'customer' | 'agent', content: string }} SimTurn */
/** @typedef {{ verdict: 'positive' | 'negative', reason: string }} SimVerdict */

const TURN_DELAY_MS = 620;

function checkAborted(signal) {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    const t = window.setTimeout(resolve, ms);
    if (signal) {
      const onAbort = () => {
        window.clearTimeout(t);
        reject(new DOMException('Aborted', 'AbortError'));
      };
      if (signal.aborted) onAbort();
      else signal.addEventListener('abort', onAbort, { once: true });
    }
  });
}

function pickSpotlightSkill(skills, counts) {
  if (!skills?.length) return null;
  let best = skills[0];
  let bestLv = getSkillStep(best.id, counts);
  for (const s of skills) {
    const lv = getSkillStep(s.id, counts);
    if (lv > bestLv) {
      best = s;
      bestLv = lv;
    }
  }
  return { skill: best, level: bestLv };
}

function buildAgentExampleLine(customer, skills, counts) {
  const spot = pickSpotlightSkill(skills, counts);
  if (!spot) {
    return `불편을 드려 죄송합니다. ${customer.concern} 말씀부터 차근히 짚어 보겠습니다. 우선 현재 상황을 한 가지만 더 여쭤볼게요. (예시 응답)`;
  }
  const { skill, level } = spot;
  const overview = resolveSkillSummary(skill);
  const short =
    overview.length > 100 ? `${overview.slice(0, 98)}…` : overview;
  return `불편 드려 죄송합니다. ${customer.concern} 관련해서는 제가 ${skill.name} 쪽으로 숙련도 ${level}/${SKILL_PROGRESS_MAX}인 편이라, ${short}에 맞춰 설명드리겠습니다. 지금 가장 우선 해결하고 싶은 지점이 어디일까요? (예시 응답)`;
}

function isPositiveVerdict(skills, counts, difficulty) {
  if (!skills?.length) return false;
  const avg =
    skills.reduce((a, s) => a + getSkillStep(s.id, counts), 0) / skills.length;
  return avg >= difficulty;
}

/**
 * 고객 → 상담사 → 고객(반응) 3턴 예시. 평균 스킬 단계와 난이도로 긍정·비긍정 판정.
 * @param {{
 *   customer: SimCustomer,
 *   skills: { id: string, name: string, summary?: string }[],
 *   counts: Record<string, number>,
 *   onTurn?: (t: SimTurn) => void,
 *   onStatus?: (s: string) => void,
 *   signal?: AbortSignal,
 * }} opts
 * @returns {Promise<SimVerdict>}
 */
export async function runThreeTurnMockSimulation(opts) {
  const { customer, skills, counts, onTurn, onStatus, signal } = opts;

  const positive = isPositiveVerdict(skills, counts, customer.difficulty);

  checkAborted(signal);
  onStatus?.('① AI 고객 메시지 (예시)');
  await delay(TURN_DELAY_MS, signal);
  const first = `${customer.displayName}입니다. ${customer.concern} 때문에 연락드렸어요. ${customer.tone} 말씀드리면, 일단 기분이 많이 안 좋습니다. (예시)`;
  onTurn?.({ role: 'customer', content: first });

  checkAborted(signal);
  onStatus?.('② 상담사(내 캐릭·스킬 반영 예시)');
  await delay(TURN_DELAY_MS, signal);
  onTurn?.({
    role: 'agent',
    content: buildAgentExampleLine(customer, skills, counts),
  });

  checkAborted(signal);
  onStatus?.('③ AI 고객 반응 (예시)');
  await delay(TURN_DELAY_MS, signal);

  const third = positive
    ? `…그렇게 정리해 주시니 이해가 됩니다. 한번 말씀 주신 방향으로 진행해 볼게요. ${customer.goal}에 가깝게 느껴집니다. (예시 · 긍정)`
    : `솔직히 아직 납득이 덜 됩니다. ${customer.goal}까지는 못 미치는 것 같아요. 해지나 다른 업체 쪽도 알아보겠습니다. (예시 · 비긍정)`;

  onTurn?.({ role: 'customer', content: third });

  onStatus?.('');
  return {
    verdict: positive ? 'positive' : 'negative',
    reason: positive
      ? `평균 스킬 단계가 고객 난이도(${customer.difficulty}/5) 이상이라(예시 규칙) 긍정 마무리로 판단했습니다.`
      : `평균 스킬 단계가 고객 난이도(${customer.difficulty}/5)에 미치지 못해(예시 규칙) 비긍정으로 판단했습니다. 대시보드 미션으로 숙련도를 올려 보세요.`,
  };
}
