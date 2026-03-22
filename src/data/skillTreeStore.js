/** 데모: 스킬 트리. 실서비스는 API로 대체. */

export const DEFAULT_SKILLS = [
  {
    id: 'root-base',
    name: '상담 기초',
    parentId: null,
    summary:
      '인사·경청·공감 표현·기본 예의 등 모든 상담의 바탕이 되는 태도와 절차를 다룹니다.',
  },
  {
    id: 'skill-foundation',
    name: '기초',
    parentId: 'root-base',
    summary:
      '상담 오프닝, 본인 확인, 상황 파악 질문 등 초반 대화를 안정적으로 이끄는 기술입니다.',
  },
  {
    id: 'skill-empathy',
    name: '공감',
    parentId: 'root-base',
    summary:
      '고객 감정을 인정하고 언어·톤으로 공감해 신뢰를 쌓고 방어를 낮춥니다.',
  },
  {
    id: 'skill-product',
    name: '상품',
    parentId: 'root-base',
    summary:
      '요금제·부가서비스·약정 조건을 정확히 설명하고 고객 니즈에 맞게 제안합니다.',
  },
  {
    id: 'skill-closing',
    name: '마무리',
    parentId: 'root-base',
    summary:
      '합의 내용을 정리하고 다음 액션·후속 안내까지 명확히 클로징합니다.',
  },
  {
    id: 'skill-vip',
    name: 'VIP 응대',
    parentId: 'skill-empathy',
    summary:
      '우수·장기 고객에 맞는 톤과 혜택 설명, 불만 시 빠른 복구 제안을 다룹니다.',
  },
  {
    id: 'skill-cross',
    name: '크로스셀',
    parentId: 'skill-product',
    summary:
      '기존 상품과 연계한 추가 상품·결합을 자연스럽게 제안하는 설득 기법입니다.',
  },
];

const STORAGE_KEY = 'you-demo-skills-v1';

export const SKILL_TREE_CHANGED = 'you-skill-tree-changed';

function safeParse(raw) {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

export function getSkills() {
  if (typeof window === 'undefined') return [...DEFAULT_SKILLS];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [...DEFAULT_SKILLS];
  const parsed = safeParse(raw);
  if (!parsed?.length) return [...DEFAULT_SKILLS];
  return parsed;
}

export function saveSkills(skills) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
  window.dispatchEvent(new CustomEvent(SKILL_TREE_CHANGED));
}

/**
 * 스킬 개요(시뮬·프롬프트용). 저장값 없으면 기본 스킬 정의 또는 이름 기반 문장.
 * @param {{ id: string, name: string, summary?: string }} skill
 */
export function resolveSkillSummary(skill) {
  if (!skill) return '';
  if (typeof skill.summary === 'string' && skill.summary.trim()) {
    return skill.summary.trim();
  }
  const def = DEFAULT_SKILLS.find((d) => d.id === skill.id);
  if (def?.summary) return def.summary;
  return `${skill.name}에 관한 상담·응대 역량입니다.`;
}

export function addSkill(name, parentId) {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  const skills = getSkills();
  const id = `skill-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const pid =
    parentId && skills.some((s) => s.id === parentId) ? parentId : null;
  const next = [...skills, { id, name: trimmed, parentId: pid }];
  saveSkills(next);
  return id;
}

/** React Flow 좌표 저장 — 상담사 화면과 동일한 위치로 공유 */
export function updateSkillFlowPosition(skillId, x, y) {
  const skills = getSkills();
  if (!skills.some((s) => s.id === skillId)) return;
  const rx = Math.round(Number(x) || 0);
  const ry = Math.round(Number(y) || 0);
  const next = skills.map((s) =>
    s.id === skillId ? { ...s, flowX: rx, flowY: ry } : s
  );
  saveSkills(next);
}

/** 관리자 저장 좌표 전부 제거 → 자동 방사형 배치만 사용 */
export function clearAllSkillFlowPositions() {
  const skills = getSkills();
  const next = skills.map((s) => {
    const { flowX, flowY, ...rest } = s;
    return rest;
  });
  saveSkills(next);
}

/** nodeId가 ancestorId의 (직·간접) 하위인지 */
function isStrictDescendant(skills, nodeId, ancestorId) {
  if (!ancestorId || !nodeId || nodeId === ancestorId) return false;
  const byId = Object.fromEntries(skills.map((s) => [s.id, s]));
  let cur = byId[nodeId];
  const guard = new Set();
  while (cur?.parentId && !guard.has(cur.id)) {
    guard.add(cur.id);
    if (cur.parentId === ancestorId) return true;
    cur = byId[cur.parentId];
  }
  return false;
}

/**
 * 기존 노드의 상위 변경. 하위 트리는 그대로 따라감.
 * @param {string} skillId
 * @param {string | null} newParentId null이면 루트
 * @returns {{ ok: boolean, reason?: string }}
 */
export function reparentSkill(skillId, newParentId) {
  const skills = getSkills();
  if (!skills.some((s) => s.id === skillId)) {
    return { ok: false, reason: 'notfound' };
  }
  const pid = newParentId ?? null;
  if (pid === skillId) return { ok: false, reason: 'self' };
  if (pid && !skills.some((s) => s.id === pid)) {
    return { ok: false, reason: 'badparent' };
  }
  if (pid && isStrictDescendant(skills, pid, skillId)) {
    return { ok: false, reason: 'cycle' };
  }
  const next = skills.map((s) => {
    if (s.id !== skillId) return s;
    const { flowX, flowY, ...rest } = s;
    return { ...rest, parentId: pid };
  });
  saveSkills(next);
  return { ok: true };
}

/**
 * 노드 삭제. 직속 자식은 삭제된 노드의 parentId(한 단계 위)로 승격.
 * @returns {{ ok: boolean, reason?: string }}
 */
export function deleteSkill(skillId) {
  const skills = getSkills();
  const victim = skills.find((s) => s.id === skillId);
  if (!victim) return { ok: false, reason: 'notfound' };
  const gp = victim.parentId ?? null;
  const next = skills
    .filter((s) => s.id !== skillId)
    .map((s) => (s.parentId === skillId ? { ...s, parentId: gp } : s));
  saveSkills(next);
  return { ok: true };
}

/** @returns {{ id: string, name: string, parentId: string | null, children: ReturnType<typeof buildSkillTree> }[]} */
export function buildSkillTree(skills) {
  const byParent = new Map();
  for (const s of skills) {
    const p = s.parentId ?? null;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p).push({ ...s, children: [] });
  }
  const roots = byParent.get(null) || [];
  function attach(node) {
    const kids = byParent.get(node.id) || [];
    return {
      ...node,
      children: kids.map(attach),
    };
  }
  return roots.map(attach);
}

export function flattenSkillsForSelect(skills) {
  const tree = buildSkillTree(skills);
  const out = [];
  function walk(nodes, depth) {
    for (const n of nodes) {
      out.push({ id: n.id, name: n.name, depth });
      if (n.children?.length) walk(n.children, depth + 1);
    }
  }
  walk(tree, 0);
  return out;
}

export function skillNameMap(skills) {
  return Object.fromEntries(skills.map((s) => [s.id, s.name]));
}
