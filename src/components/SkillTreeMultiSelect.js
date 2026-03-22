import { Fragment, useMemo } from 'react';
import { buildSkillTree } from '../data/skillTreeStore';

/**
 * 트리 구조를 유지한 채 스킬 다중 선택
 * @param {{ id: string, name: string, parentId: string | null }[]} skills
 * @param {string[]} selectedIds
 * @param {(ids: string[]) => void} onChange
 */
export default function SkillTreeMultiSelect({
  skills,
  selectedIds,
  onChange,
}) {
  const tree = useMemo(() => buildSkillTree(skills), [skills]);

  const toggle = (id) => {
    const set = new Set(selectedIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange([...set]);
  };

  const renderNodes = (nodes, depth) =>
    nodes.map((n) => (
      <Fragment key={n.id}>
        <label
          className="manager-skill-pick-row"
          style={{ paddingLeft: `${0.65 + depth * 0.85}rem` }}
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(n.id)}
            onChange={() => toggle(n.id)}
          />
          <span className="manager-skill-pick-row__name">{n.name}</span>
        </label>
        {n.children?.length ? renderNodes(n.children, depth + 1) : null}
      </Fragment>
    ));

  return (
    <div
      className="manager-skill-pick-list"
      role="group"
      aria-label="연결 스킬 다중 선택"
    >
      {tree.length ? (
        renderNodes(tree, 0)
      ) : (
        <p className="manager-skill-pick-empty">등록된 스킬이 없습니다.</p>
      )}
    </div>
  );
}
