import {
  getSkillStep,
  SKILL_PROGRESS_MAX,
} from '../data/agentSkillProgressStore';
import { buildSkillTree } from '../data/skillTreeStore';
import { computeRadialLayoutFromRoots } from './radialSkillLayout';

export function getSkillNodeStatusClass(id, counts, recommendedIds) {
  const c = getSkillStep(id, counts);
  const rec = recommendedIds.includes(id) && c < SKILL_PROGRESS_MAX;
  if (c >= SKILL_PROGRESS_MAX) return 'agent-skill-flow-node--done';
  if (c > 0) {
    return rec
      ? 'agent-skill-flow-node--active agent-skill-flow-node--ai'
      : 'agent-skill-flow-node--active';
  }
  return rec
    ? 'agent-skill-flow-node--locked agent-skill-flow-node--ai'
    : 'agent-skill-flow-node--locked';
}

/** 방사형 좌표 → 픽셀 (dr를 작게 쓰므로 스케일로 확대해 화면을 채움) */
const POSITION_SCALE = 34;

const LAYOUT_RADIAL = { cx: 50, cy: 50, dr: 11 };

/**
 * @param {{ flowX?: number, flowY?: number } | undefined} skill
 * @param {{ x: number, y: number }} layoutEntry
 */
function resolveFlowPosition(skill, layoutEntry) {
  if (
    skill &&
    typeof skill.flowX === 'number' &&
    typeof skill.flowY === 'number' &&
    !Number.isNaN(skill.flowX) &&
    !Number.isNaN(skill.flowY)
  ) {
    return { x: skill.flowX, y: skill.flowY };
  }
  return {
    x: layoutEntry.x * POSITION_SCALE,
    y: layoutEntry.y * POSITION_SCALE,
  };
}

/**
 * @param {{ id: string, name: string, parentId: string | null, flowX?: number, flowY?: number }[]} skills
 * @param {{ counts: Record<string, number>, recommendedIds: string[] }} progressState
 */
export function skillsToReactFlowElements(skills, progressState) {
  const { counts, recommendedIds } = progressState;
  const roots = buildSkillTree(skills);
  const layoutFull = computeRadialLayoutFromRoots(roots, LAYOUT_RADIAL);
  const byId = Object.fromEntries(skills.map((s) => [s.id, s]));

  const nodes = layoutFull
    .filter((n) => n.id !== '__virtual_root__')
    .map((n) => ({
      id: n.id,
      type: 'skill',
      position: resolveFlowPosition(byId[n.id], n),
      width: 96,
      height: 132,
      data: {
        label: n.name,
        step: getSkillStep(n.id, counts),
        max: SKILL_PROGRESS_MAX,
        statusClass: getSkillNodeStatusClass(n.id, counts, recommendedIds),
      },
    }));

  /** @type {{ id: string, source: string, target: string, type: string, style: object }[]} */
  const edges = [];

  function walkTree(node) {
    for (const ch of node.children || []) {
      edges.push({
        id: `e-${node.id}-${ch.id}`,
        source: node.id,
        target: ch.id,
        type: 'smoothstep',
        style: { stroke: '#4f46e5', strokeWidth: 2.5 },
      });
      walkTree(ch);
    }
  }
  roots.forEach((r) => walkTree(r));

  return { nodes, edges };
}

/**
 * 관리자: 진행도 없이 트리만
 * @param {string | null | undefined} selectedNodeId 선택된 노드(테두리 강조)
 */
export function skillsToManagerReactFlowElements(skills, selectedNodeId) {
  const roots = buildSkillTree(skills);
  const layoutFull = computeRadialLayoutFromRoots(roots, LAYOUT_RADIAL);
  const byId = Object.fromEntries(skills.map((s) => [s.id, s]));

  const nodes = layoutFull
    .filter((n) => n.id !== '__virtual_root__')
    .map((n) => {
      const skill = byId[n.id];
      return {
        id: n.id,
        type: 'managerSkill',
        position: resolveFlowPosition(skill, n),
        width: 96,
        height: 112,
        data: {
          label: n.name,
          selected: Boolean(selectedNodeId && String(selectedNodeId) === n.id),
        },
      };
    });

  /** @type {{ id: string, source: string, target: string, type: string, style: object }[]} */
  const edges = [];

  function walkTree(node) {
    for (const ch of node.children || []) {
      edges.push({
        id: `e-${node.id}-${ch.id}`,
        source: node.id,
        target: ch.id,
        type: 'smoothstep',
        style: { stroke: '#7c3aed', strokeWidth: 2.5 },
      });
      walkTree(ch);
    }
  }
  roots.forEach((r) => walkTree(r));

  return { nodes, edges };
}
