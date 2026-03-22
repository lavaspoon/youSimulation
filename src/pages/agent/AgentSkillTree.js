import { useCallback, useEffect, useMemo, useState } from 'react';
import AgentSkillFlowView from '../../components/AgentSkillFlowView';
import {
  AGENT_SKILL_PROGRESS_CHANGED,
  getSkillProgressState,
  getSkillStep,
  SKILL_PROGRESS_MAX,
} from '../../data/agentSkillProgressStore';
import {
  buildSkillTree,
  getSkills,
  SKILL_TREE_CHANGED,
} from '../../data/skillTreeStore';
import { skillsToReactFlowElements } from '../../utils/skillsToReactFlow';

/** @param {{ id: string, children?: object[] }} node */
function collectSubtreeIds(node) {
  const ids = [node.id];
  for (const ch of node.children || []) {
    ids.push(...collectSubtreeIds(ch));
  }
  return ids;
}

function percentForIds(ids, counts) {
  if (!ids.length) return 0;
  const sum = ids.reduce((acc, id) => acc + getSkillStep(id, counts), 0);
  const cap = ids.length * SKILL_PROGRESS_MAX;
  return cap > 0 ? Math.round((sum / cap) * 100) : 0;
}

export default function AgentSkillTree() {
  const [skills, setSkills] = useState(() => getSkills());
  const [progress, setProgress] = useState(() => getSkillProgressState());

  const sync = useCallback(() => {
    setSkills(getSkills());
    setProgress(getSkillProgressState());
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener(SKILL_TREE_CHANGED, sync);
    window.addEventListener(AGENT_SKILL_PROGRESS_CHANGED, sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener(SKILL_TREE_CHANGED, sync);
      window.removeEventListener(AGENT_SKILL_PROGRESS_CHANGED, sync);
      window.removeEventListener('focus', sync);
    };
  }, [sync]);

  const { overallPercent, rootPercents } = useMemo(() => {
    const counts = progress.counts;
    const tree = buildSkillTree(skills);
    const rootPercents = tree.map((root) => ({
      id: root.id,
      name: root.name,
      percent: percentForIds(collectSubtreeIds(root), counts),
    }));
    const allIds = skills.map((s) => s.id);
    const overallPercent = percentForIds(allIds, counts);
    return { overallPercent, rootPercents };
  }, [skills, progress.counts]);

  const { nodes, edges } = useMemo(
    () => skillsToReactFlowElements(skills, progress),
    [skills, progress]
  );

  return (
    <>
      <header className="manager-header">
        <div className="header-content">
          <div className="header-left">
            <h1>나의 스킬</h1>
            <p>
              스킬마다 <strong>0/{SKILL_PROGRESS_MAX}</strong> 단계 · 대시보드에서 미션을
              완료(체크)할 때마다 연결 스킬이 <strong>+1</strong> (최대 {SKILL_PROGRESS_MAX}) ·
              달성률은 해당 트리 구간의 단계 합 기준입니다.
            </p>
          </div>
        </div>
      </header>

      <div className="agent-skill-page">
        <section className="agent-skill-achievement" aria-label="스킬 달성률">
          <div className="agent-skill-achievement__overall">
            <div className="agent-skill-achievement__overall-head">
              <span className="agent-skill-achievement__overall-label">
                전체 달성률
              </span>
              <span className="agent-skill-achievement__overall-value">
                {overallPercent}%
              </span>
            </div>
            <div
              className="agent-skill-achievement__bar"
              role="progressbar"
              aria-valuenow={overallPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="agent-skill-achievement__bar-fill"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>
          <div className="agent-skill-achievement__roots">
            {rootPercents.map((r) => (
              <div key={r.id} className="agent-skill-achievement__card">
                <div className="agent-skill-achievement__card-head">
                  <span className="agent-skill-achievement__card-name">{r.name}</span>
                  <span className="agent-skill-achievement__card-pct">{r.percent}%</span>
                </div>
                <div
                  className="agent-skill-achievement__bar agent-skill-achievement__bar--sm"
                  role="progressbar"
                  aria-valuenow={r.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${r.name} 달성률 ${r.percent}%`}
                >
                  <div
                    className="agent-skill-achievement__bar-fill agent-skill-achievement__bar-fill--sub"
                    style={{ width: `${r.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div
          className="agent-radial-panel agent-radial-panel--reactflow"
          aria-label="스킬 트리"
        >
          <div className="agent-radial-legend">
            <span>
              <span className="agent-radial-legend__swatch agent-radial-legend__swatch--done" />
              완료
            </span>
            <span>
              <span className="agent-radial-legend__swatch agent-radial-legend__swatch--active" />
              진행 중
            </span>
            <span>
              <span className="agent-radial-legend__swatch agent-radial-legend__swatch--locked" />
              미시작
            </span>
          </div>

          <div className="agent-radial-svg-wrap agent-radial-svg-wrap--flow">
            <AgentSkillFlowView nodes={nodes} edges={edges} />
          </div>
        </div>
      </div>
    </>
  );
}
