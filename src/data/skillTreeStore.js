/** 데모: 스킬 트리. 실서비스는 API로 대체. */

export const DEFAULT_SKILLS = [
  { id: 'root-base', name: '상담 기초', parentId: null },
  { id: 'skill-foundation', name: '기초', parentId: 'root-base' },
  { id: 'skill-empathy', name: '공감', parentId: 'root-base' },
  { id: 'skill-product', name: '상품', parentId: 'root-base' },
  { id: 'skill-closing', name: '마무리', parentId: 'root-base' },
  { id: 'skill-vip', name: 'VIP 응대', parentId: 'skill-empathy' },
  { id: 'skill-cross', name: '크로스셀', parentId: 'skill-product' },
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
