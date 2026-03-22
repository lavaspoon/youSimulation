import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AGENT_SKILL_PROGRESS_CHANGED,
  getSkillProgressState,
  getSkillStep,
  SKILL_PROGRESS_MAX,
} from '../../data/agentSkillProgressStore';
import {
  addSimulationPoints,
  AGENT_SIMULATION_CHANGED,
  formatRemainingShort,
  generateAiCustomer,
  getCustomerWindowId,
  getRotationRemainingMs,
  getSimulationPoints,
} from '../../data/agentSimulationStore';
import { runThreeTurnMockSimulation } from '../../services/simulationDialogueService';
import {
  getSkills,
  resolveSkillSummary,
  SKILL_TREE_CHANGED,
} from '../../data/skillTreeStore';

const PLAYED_WINDOW_KEY = 'you-demo-sim-played-window-v1';

function getPlayedWindowId() {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(PLAYED_WINDOW_KEY);
  if (raw == null || raw === '') return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

function setPlayedWindowId(windowId) {
  sessionStorage.setItem(PLAYED_WINDOW_KEY, String(windowId));
}

let bubbleId = 0;
function nextBubbleId() {
  bubbleId += 1;
  return `sim-bubble-${bubbleId}`;
}

export default function AgentChallenge() {
  const [customer, setCustomer] = useState(() => generateAiCustomer());
  const [remainingMs, setRemainingMs] = useState(() =>
    getRotationRemainingMs()
  );
  const customerWindowRef = useRef(customer.windowId);
  const [simPoints, setSimPoints] = useState(() => getSimulationPoints());
  const [counts, setCounts] = useState(() => getSkillProgressState().counts);
  const [playedWindowId, setPlayedWindowIdState] = useState(getPlayedWindowId);
  const [lines, setLines] = useState([]);
  const [simRunning, setSimRunning] = useState(false);
  const [simStatus, setSimStatus] = useState('');
  const [simVerdict, setSimVerdict] = useState(null);
  const [simError, setSimError] = useState(null);
  const [skillTreeVersion, setSkillTreeVersion] = useState(0);
  const abortRef = useRef(null);

  const syncCounts = useCallback(
    () => setCounts(getSkillProgressState().counts),
    []
  );

  useEffect(() => {
    const syncPoints = () => setSimPoints(getSimulationPoints());
    window.addEventListener(AGENT_SIMULATION_CHANGED, syncPoints);
    return () =>
      window.removeEventListener(AGENT_SIMULATION_CHANGED, syncPoints);
  }, []);

  useEffect(() => {
    syncCounts();
    window.addEventListener(AGENT_SKILL_PROGRESS_CHANGED, syncCounts);
    return () =>
      window.removeEventListener(AGENT_SKILL_PROGRESS_CHANGED, syncCounts);
  }, [syncCounts]);

  useEffect(() => {
    const bump = () => setSkillTreeVersion((v) => v + 1);
    window.addEventListener(SKILL_TREE_CHANGED, bump);
    return () => window.removeEventListener(SKILL_TREE_CHANGED, bump);
  }, []);

  useEffect(() => {
    const tick = () => {
      const wid = getCustomerWindowId();
      if (wid !== customerWindowRef.current) {
        customerWindowRef.current = wid;
        setCustomer(generateAiCustomer());
        setLines([]);
        setSimVerdict(null);
        setSimError(null);
        setSimStatus('');
        setPlayedWindowIdState(getPlayedWindowId());
      }
      setRemainingMs(getRotationRemainingMs());
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    []
  );

  const myCharacter = useMemo(() => {
    void skillTreeVersion;
    const skills = getSkills();
    if (!skills.length) {
      return {
        avg: 0,
        count: 0,
        highlights: [],
      };
    }
    const avg =
      skills.reduce((a, s) => a + getSkillStep(s.id, counts), 0) /
      skills.length;
    const sorted = [...skills].sort(
      (a, b) =>
        getSkillStep(b.id, counts) - getSkillStep(a.id, counts)
    );
    const highlights = sorted.slice(0, 4).map((s) => ({
      name: s.name,
      step: getSkillStep(s.id, counts),
      blurb: resolveSkillSummary(s),
    }));
    return { avg, count: skills.length, highlights };
  }, [counts, skillTreeVersion]);

  const alreadyPlayedThisSlot = playedWindowId === customer.windowId;
  const hasSkills = myCharacter.count > 0;

  const canStart = hasSkills && !simRunning && !alreadyPlayedThisSlot;

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleStart = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setSimRunning(true);
    setLines([]);
    setSimVerdict(null);
    setSimError(null);

    const skills = getSkills();
    const liveCounts = getSkillProgressState().counts;

    try {
      const verdict = await runThreeTurnMockSimulation({
        customer,
        skills,
        counts: liveCounts,
        signal: ac.signal,
        onStatus: setSimStatus,
        onTurn: (t) =>
          setLines((prev) => [
            ...prev,
            { id: nextBubbleId(), role: t.role, content: t.content },
          ]),
      });
      setSimVerdict(verdict);
      setPlayedWindowId(customer.windowId);
      setPlayedWindowIdState(customer.windowId);
      if (verdict.verdict === 'positive') {
        const pts = 48 + customer.difficulty * 22;
        const next = addSimulationPoints(pts);
        setSimPoints(next);
      }
    } catch (e) {
      if (e?.name === 'AbortError') {
        setSimStatus('취소됨');
      } else {
        setSimError(e?.message || '오류가 발생했습니다.');
      }
    } finally {
      setSimRunning(false);
    }
  }, [customer]);

  return (
    <>
      <header className="manager-header">
        <div className="header-content">
          <div className="header-left">
            <h1>시뮬레이션</h1>
            <p className="manager-header__one-line">
              2시간마다 바뀌는 AI 고객과 3턴 예시 대화 후 긍정·비긍정(긍정 시 포인트).
            </p>
          </div>
        </div>
      </header>

      <div className="agent-simulation-page agent-simulation-page--gds">
        <div className="agent-simulation-simbar">
          <span className="agent-simulation-simbar__brand">예시 대화</span>
          <span className="agent-simulation-simbar__points">
            시뮬 적립{' '}
            <strong>{simPoints.toLocaleString('ko-KR')}P</strong>
          </span>
        </div>

        {alreadyPlayedThisSlot && !simRunning ? (
          <p className="agent-sim-slot-done" role="status">
            이번 슬롯 참여 완료 — 다음 고객 갱신 후 다시 시작할 수 있습니다.
          </p>
        ) : null}

        <div className="agent-sim-chars" aria-label="등장 캐릭터">
          <article className="agent-sim-char agent-sim-char--ai">
            <div className="agent-sim-char__ribbon">AI 고객</div>
            <div className="agent-sim-char__top">
              <div className="agent-sim-char__avatar agent-sim-char__avatar--ai" aria-hidden>
                AI
              </div>
              <div className="agent-sim-char__headline">
                <h2 className="agent-sim-char__name">{customer.displayName}</h2>
                <p className="agent-sim-char__sub">
                  난이도 {customer.difficultyLabel} · 다음 교체{' '}
                  {formatRemainingShort(remainingMs)}
                </p>
              </div>
            </div>
            <p className="agent-sim-char__desc">
              <strong>상황</strong> {customer.concern}
            </p>
            <p className="agent-sim-char__desc">
              <strong>목표</strong> {customer.goal}
            </p>
            <p className="agent-sim-char__desc">
              <strong>말투·성향</strong> {customer.tone}
            </p>
          </article>

          <article className="agent-sim-char agent-sim-char--me">
            <div className="agent-sim-char__ribbon agent-sim-char__ribbon--me">
              내 캐릭터
            </div>
            <div className="agent-sim-char__top">
              <div className="agent-sim-char__avatar agent-sim-char__avatar--me" aria-hidden>
                나
              </div>
              <div className="agent-sim-char__headline">
                <h2 className="agent-sim-char__name">상담사 (나)</h2>
                <p className="agent-sim-char__sub">
                  스킬 트리 기반 페르소나 · 평균 숙련도{' '}
                  {myCharacter.count
                    ? `${(myCharacter.avg).toFixed(1)}/${SKILL_PROGRESS_MAX}`
                    : '—'}
                </p>
              </div>
            </div>
            {myCharacter.count === 0 ? (
              <p className="agent-sim-char__desc">
                등록된 스킬이 없습니다. 관리자 메뉴에서 스킬을 추가하면 대화 예시에
                반영됩니다.
              </p>
            ) : (
              <>
                <p className="agent-sim-char__intro">
                  아래 스킬 <strong>개요</strong>와 <strong>단계</strong>가 예시 대화의
                  상담사 대사에 녹아 들어갑니다.
                </p>
                <ul className="agent-sim-char__skill-list">
                  {myCharacter.highlights.map((h) => (
                    <li key={h.name}>
                      <span className="agent-sim-char__skill-name">
                        {h.name}{' '}
                        <span className="agent-sim-char__skill-step">
                          {h.step}/{SKILL_PROGRESS_MAX}
                        </span>
                      </span>
                      <span className="agent-sim-char__skill-blurb">{h.blurb}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </article>
        </div>

        <section className="agent-sim-dialogue" aria-label="대화 시뮬레이션">
          <div className="agent-sim-dialogue__toolbar">
            <h2 className="agent-sim-dialogue__title">대화</h2>
            <div className="agent-sim-dialogue__actions">
              {simRunning ? (
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={handleCancel}
                >
                  취소
                </button>
              ) : null}
              <button
                type="button"
                className="btn-primary-action"
                disabled={!canStart}
                onClick={handleStart}
              >
                시뮬레이션 시작
              </button>
            </div>
          </div>

          {!canStart && !simRunning && !alreadyPlayedThisSlot && !hasSkills ? (
            <p className="agent-sim-dialogue__warn">
              스킬 트리에 스킬이 있어야 시작할 수 있습니다.
            </p>
          ) : null}

          {simStatus ? (
            <p className="agent-sim-dialogue__status" role="status">
              {simStatus}
            </p>
          ) : null}
          {simError ? (
            <p className="agent-sim-dialogue__error" role="alert">
              {simError}
            </p>
          ) : null}

          <div className="agent-sim-dialogue__thread">
            {lines.length === 0 && !simRunning ? (
              <p className="agent-sim-dialogue__empty">
                고객 → 나 → 고객 순으로 예시가 표시됩니다.
              </p>
            ) : null}
            <ul className="agent-sim-dialogue__list">
              {lines.map((m) => (
                <li
                  key={m.id}
                  className={`agent-sim-dialogue__item agent-sim-dialogue__item--${m.role}`}
                >
                  <span className="agent-sim-dialogue__who">
                    {m.role === 'customer' ? 'AI 고객' : '상담사 (내 캐릭)'}
                  </span>
                  <div className="agent-sim-dialogue__bubble">{m.content}</div>
                </li>
              ))}
            </ul>
          </div>

          {simVerdict ? (
            <div
              className={`agent-simulation-verdict agent-simulation-verdict--${simVerdict.verdict}`}
              role="region"
              aria-label="최종 판정"
            >
              <p className="agent-simulation-verdict__label">최종 결과</p>
              <p className="agent-simulation-verdict__main">
                {simVerdict.verdict === 'positive' ? '긍정' : '비긍정'}
              </p>
              <p className="agent-simulation-verdict__reason">
                {simVerdict.reason}
              </p>
              {simVerdict.verdict === 'positive' ? (
                <p className="agent-simulation-verdict__bonus">
                  시뮬 포인트가 지급되었습니다.
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
}
