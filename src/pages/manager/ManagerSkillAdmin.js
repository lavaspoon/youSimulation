import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ManagerSkillFlowView from '../../components/ManagerSkillFlowView';
import {
  addSkill,
  deleteSkill,
  getSkills,
  reparentSkill,
  saveSkills,
  SKILL_TREE_CHANGED,
  updateSkillFlowPosition,
} from '../../data/skillTreeStore';
import { skillsToManagerReactFlowElements } from '../../utils/skillsToReactFlow';

function skillsSnapshot(skillsList) {
  return JSON.stringify(skillsList);
}

export default function ManagerSkillAdmin() {
  const [skills, setSkills] = useState(() => getSkills());
  const savedBaselineRef = useRef(skillsSnapshot(getSkills()));
  const [configDirty, setConfigDirty] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [reparentSourceId, setReparentSourceId] = useState(null);
  const [addingChildFor, setAddingChildFor] = useState(null);
  const [newChildName, setNewChildName] = useState('');
  const [rootAddOpen, setRootAddOpen] = useState(false);
  const [newRootName, setNewRootName] = useState('');
  const [layoutResetKey, setLayoutResetKey] = useState(0);

  const sync = useCallback(() => {
    const next = getSkills();
    setSkills(next);
    setConfigDirty(skillsSnapshot(next) !== savedBaselineRef.current);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener(SKILL_TREE_CHANGED, sync);
    return () => window.removeEventListener(SKILL_TREE_CHANGED, sync);
  }, [sync]);

  const handleSaveConfig = useCallback(() => {
    const next = getSkills();
    saveSkills(next);
    savedBaselineRef.current = skillsSnapshot(next);
    setConfigDirty(false);
  }, []);

  const { nodes, edges } = useMemo(
    () => skillsToManagerReactFlowElements(skills, selectedNodeId),
    [skills, selectedNodeId]
  );

  const selectedSkill = useMemo(
    () => (selectedNodeId ? skills.find((s) => s.id === selectedNodeId) : null),
    [skills, selectedNodeId]
  );

  const selectedIsRoot = Boolean(selectedSkill && selectedSkill.parentId == null);

  const reparentErrorMessage = useCallback((reason) => {
    if (reason === 'cycle') {
      return '자기 자신이나 그 하위 노드 아래로는 옮길 수 없습니다.';
    }
    if (reason === 'self') return '자기 자신을 상위로 지정할 수 없습니다.';
    if (reason === 'badparent' || reason === 'notfound') {
      return '선택한 노드를 찾을 수 없습니다.';
    }
    return '부모를 변경할 수 없습니다.';
  }, []);

  const handleNodeClick = useCallback(
    (id) => {
      if (reparentSourceId) {
        if (id === reparentSourceId) {
          setReparentSourceId(null);
          return;
        }
        const r = reparentSkill(reparentSourceId, id);
        if (!r.ok) window.alert(reparentErrorMessage(r.reason));
        else setLayoutResetKey((k) => k + 1);
        setReparentSourceId(null);
        return;
      }
      setSelectedNodeId(id);
      setAddingChildFor(null);
      setNewChildName('');
    },
    [reparentSourceId, reparentErrorMessage]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setReparentSourceId(null);
    setAddingChildFor(null);
    setNewChildName('');
  }, []);

  const handleToolbarReparent = useCallback(() => {
    if (!selectedNodeId) return;
    setReparentSourceId(selectedNodeId);
    setAddingChildFor(null);
    setNewChildName('');
  }, [selectedNodeId]);

  const handleReparentToRoot = useCallback(() => {
    if (!reparentSourceId) return;
    const r = reparentSkill(reparentSourceId, null);
    if (!r.ok) window.alert(reparentErrorMessage(r.reason));
    else setLayoutResetKey((k) => k + 1);
    setReparentSourceId(null);
  }, [reparentSourceId, reparentErrorMessage]);

  const handleCancelReparent = useCallback(() => {
    setReparentSourceId(null);
  }, []);

  const handleToolbarDelete = useCallback(() => {
    if (!selectedNodeId) return;
    const skill = skills.find((s) => s.id === selectedNodeId);
    const label = skill?.name ?? selectedNodeId;
    if (
      !window.confirm(
        `「${label}」노드를 삭제할까요?\n직속 하위 노드는 한 단계 위 상위(또는 최상위) 아래로 붙습니다.`
      )
    ) {
      return;
    }
    const r = deleteSkill(selectedNodeId);
    if (!r.ok) window.alert('삭제할 수 없습니다.');
    setSelectedNodeId(null);
    setAddingChildFor(null);
    setNewChildName('');
    setReparentSourceId(null);
  }, [selectedNodeId, skills]);

  const handleToolbarAddChild = useCallback(() => {
    if (!selectedNodeId) return;
    setAddingChildFor(selectedNodeId);
    setNewChildName('');
  }, [selectedNodeId]);

  const handleSubmitNewChild = useCallback(() => {
    const trimmed = newChildName.trim();
    if (!trimmed || !addingChildFor) return;
    addSkill(trimmed, addingChildFor);
    setNewChildName('');
    setAddingChildFor(null);
    setLayoutResetKey((k) => k + 1);
  }, [newChildName, addingChildFor]);

  const handleCancelAddChild = useCallback(() => {
    setAddingChildFor(null);
    setNewChildName('');
  }, []);

  const handlePositionCommit = useCallback((id, x, y) => {
    updateSkillFlowPosition(id, x, y);
  }, []);

  const handleRootAddSubmit = (e) => {
    e.preventDefault();
    const trimmed = newRootName.trim();
    if (!trimmed) return;
    addSkill(trimmed, null);
    setNewRootName('');
    setRootAddOpen(false);
    setLayoutResetKey((k) => k + 1);
  };

  return (
    <>
      <header className="manager-header manager-header--skill-admin">
        <div className="header-content manager-skill-admin__header-inner">
          <div className="header-left">
            <h1>스킬 트리</h1>
            <p className="manager-skill-admin__header-desc">
              노드를 선택하면 위쪽에 <strong>부모 변경</strong>, <strong>삭제</strong>,{' '}
              <strong>하위·자식 추가</strong> 메뉴가 열립니다. 위치·트리 구성을 바꾼 뒤{' '}
              <strong>구성 저장</strong>으로 확정하세요(데모: 이 브라우저 저장소, 상담사
              화면과 동일 좌표).
            </p>
          </div>
        </div>
      </header>

      <section
        className="manager-skill-admin"
        aria-labelledby="manager-skill-admin-title"
      >
        <div className="manager-skill-admin__top">
          <h2 id="manager-skill-admin-title" className="visually-hidden">
            트리 편집
          </h2>
          <div className="manager-skill-admin__top-row">
            <button
              type="button"
              className="btn-primary-action manager-skill-admin__root-add"
              onClick={() => setRootAddOpen((o) => !o)}
              aria-expanded={rootAddOpen}
            >
              루트 노드 추가
            </button>
            <button
              type="button"
              className="btn-secondary-action manager-skill-admin__save-config"
              onClick={handleSaveConfig}
              disabled={!configDirty}
              title={
                configDirty
                  ? '현재 트리·노드 위치를 저장합니다'
                  : '저장할 변경이 없습니다'
              }
            >
              구성 저장
            </button>
          </div>
          {rootAddOpen ? (
            <form
              className="manager-skill-admin__root-form"
              onSubmit={handleRootAddSubmit}
            >
              <label htmlFor="manager-new-root-name" className="visually-hidden">
                새 루트 스킬 이름
              </label>
              <input
                id="manager-new-root-name"
                className="manager-skill-admin__root-input"
                value={newRootName}
                onChange={(e) => setNewRootName(e.target.value)}
                placeholder="최상위에 붙일 스킬 이름"
                autoComplete="off"
                autoFocus
              />
              <button type="submit" className="btn-primary-action">
                추가
              </button>
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => {
                  setRootAddOpen(false);
                  setNewRootName('');
                }}
              >
                닫기
              </button>
            </form>
          ) : null}
        </div>

        <div className="manager-skill-admin__canvas-wrap">
          <ManagerSkillFlowView
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            selectedIsRoot={selectedIsRoot}
            reparentSourceId={reparentSourceId}
            addingChildFor={addingChildFor}
            newChildName={newChildName}
            onNewChildNameChange={setNewChildName}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            onPositionCommit={handlePositionCommit}
            onToolbarReparent={handleToolbarReparent}
            onToolbarDelete={handleToolbarDelete}
            onToolbarAddChild={handleToolbarAddChild}
            onSubmitNewChild={handleSubmitNewChild}
            onCancelAddChild={handleCancelAddChild}
            onReparentToRoot={handleReparentToRoot}
            onCancelReparent={handleCancelReparent}
            layoutResetKey={layoutResetKey}
          />
        </div>

        <p className="manager-skill-admin__hint">
          빈 캔버스를 클릭하면 선택이 해제됩니다. 부모 변경 중에는 다른 노드를 클릭해
          붙일 위치를 고르거나, 같은 노드를 다시 누르면 취소됩니다.
          {configDirty ? (
            <span className="manager-skill-admin__hint-dirty">
              {' '}
              변경 사항이 있습니다. 상단 <strong>구성 저장</strong>을 눌러 확정하세요.
            </span>
          ) : null}
        </p>
      </section>
    </>
  );
}
