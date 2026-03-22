import { useCallback, useEffect, useMemo, useState } from 'react';
import SkillTreeMultiSelect from '../../components/SkillTreeMultiSelect';
import {
  addMissionToPool,
  getMissionPool,
  MISSION_POOL_CHANGED,
  resolvePoolRowSkills,
} from '../../data/missionPoolStore';
import { getSkills, SKILL_TREE_CHANGED } from '../../data/skillTreeStore';

export default function ManagerMissionsPool() {
  const [pool, setPool] = useState(() => getMissionPool());
  const [skills, setSkills] = useState(() => getSkills());
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('보통');
  const [points, setPoints] = useState('150');
  const [pickedSkillIds, setPickedSkillIds] = useState([]);

  const syncPool = useCallback(() => setPool(getMissionPool()), []);
  const syncSkills = useCallback(() => setSkills(getSkills()), []);

  useEffect(() => {
    syncPool();
    syncSkills();
    window.addEventListener(MISSION_POOL_CHANGED, syncPool);
    window.addEventListener(SKILL_TREE_CHANGED, syncSkills);
    return () => {
      window.removeEventListener(MISSION_POOL_CHANGED, syncPool);
      window.removeEventListener(SKILL_TREE_CHANGED, syncSkills);
    };
  }, [syncPool, syncSkills]);

  const rows = useMemo(
    () => pool.map((r) => resolvePoolRowSkills(r)),
    [pool]
  );

  const handleRegister = (e) => {
    e.preventDefault();
    addMissionToPool({
      title,
      difficulty,
      points,
      skillIds: pickedSkillIds,
    });
    setTitle('');
    setPickedSkillIds([]);
    setDifficulty('보통');
    setPoints('150');
  };

  return (
    <>
      <header className="manager-header">
        <div className="header-content">
          <div className="header-left">
            <h1>미션 풀</h1>
            <p>등록 · 스킬트리에서 연결 스킬 다중 선택 · 난이도 · 포인트</p>
          </div>
        </div>
      </header>

      <div className="manager-mission-pool-layout">
        <section
          className="manager-panel manager-panel--mission-form"
          aria-labelledby="mission-register-heading"
        >
          <h2 id="mission-register-heading" className="manager-panel__title">
            미션 등록
          </h2>
          <p className="manager-panel__lead">
            아래 트리에서 이 미션과 연결할 스킬을 <strong>복수 선택</strong>할 수
            있습니다. 한 미션은 여러 스킬 성장에 동시에 기여할 수 있습니다.
          </p>
          <form className="manager-mission-register-form" onSubmit={handleRegister}>
            <div className="manager-field">
              <label htmlFor="mission-title">미션명</label>
              <input
                id="mission-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="미션 내용을 입력"
                autoComplete="off"
                required
              />
            </div>
            <div className="manager-field-row">
              <div className="manager-field">
                <label htmlFor="mission-diff">난이도</label>
                <select
                  id="mission-diff"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="쉬움">쉬움</option>
                  <option value="보통">보통</option>
                  <option value="도전">도전</option>
                </select>
              </div>
              <div className="manager-field">
                <label htmlFor="mission-points">포인트</label>
                <input
                  id="mission-points"
                  type="number"
                  min={0}
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                />
              </div>
            </div>
            <div className="manager-field manager-field--block">
              <span className="manager-field__label-text">연결 스킬 (다중)</span>
              <SkillTreeMultiSelect
                skills={skills}
                selectedIds={pickedSkillIds}
                onChange={setPickedSkillIds}
              />
              <p className="manager-field-hint">
                선택 {pickedSkillIds.length}개 · 스킬은 &quot;성장 설계&quot; 화면에서
                관리합니다.
              </p>
            </div>
            <button type="submit" className="btn-primary-action">
              풀에 등록
            </button>
          </form>
        </section>

        <section
          className="manager-panel manager-panel--mission-table"
          aria-labelledby="mission-pool-list-heading"
        >
          <h2 id="mission-pool-list-heading" className="manager-panel__title">
            등록된 미션
          </h2>
          <div className="manager-mission-table-wrap">
            <table className="manager-mission-table">
              <thead>
                <tr>
                  <th>미션</th>
                  <th>난이도</th>
                  <th>포인트</th>
                  <th>연결 스킬</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="manager-mission-table__title">{r.title}</td>
                    <td>{r.difficulty}</td>
                    <td>
                      <strong>{r.points}P</strong>
                    </td>
                    <td>
                      <div className="manager-mission-skill-tags">
                        {r.linkedSkills.length ? (
                          r.linkedSkills.map((s) => (
                            <span key={s.id} className="manager-mission-skill-tag">
                              {s.name}
                            </span>
                          ))
                        ) : (
                          <span className="manager-mission-skill-none">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
