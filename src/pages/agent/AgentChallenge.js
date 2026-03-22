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
  areSimulationRequirementsMet,
  CUSTOMER_ROTATION_MS,
  formatRemainingShort,
  generateAiCustomer,
  getCustomerWindowId,
  getRotationRemainingMs,
  getSimulationPoints,
} from '../../data/agentSimulationStore';

const NEGOTIATION_TICK_MS = 6000;

export default function AgentChallenge() {
  const [customer, setCustomer] = useState(() => generateAiCustomer());
  const [remainingMs, setRemainingMs] = useState(() =>
    getRotationRemainingMs()
  );
  const customerWindowRef = useRef(customer.windowId);
  const [simPoints, setSimPoints] = useState(() => getSimulationPoints());
  const [counts, setCounts] = useState(() => getSkillProgressState().counts);
  const [negotiationMeter, setNegotiationMeter] = useState(0);
  const [tickLine, setTickLine] = useState('');

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
    const tick = () => {
      const wid = getCustomerWindowId();
      if (wid !== customerWindowRef.current) {
        customerWindowRef.current = wid;
        setCustomer(generateAiCustomer());
      }
      setRemainingMs(getRotationRemainingMs());
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setNegotiationMeter(0);
    setTickLine('');
  }, [customer.windowId]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const c = customer;
      if (!c.requirements.length) {
        setTickLine(
          '등록된 스킬이 없습니다. 관리자 메뉴에서 스킬 트리를 구성해 주세요.'
        );
        return;
      }
      const live = getSkillProgressState().counts;
      const met = areSimulationRequirementsMet(c.requirements, live);
      if (!met) {
        setNegotiationMeter((m) => Math.max(0, m - 5));
        setTickLine(
          '요구 스킬 미달 — 협상 중단 (단계를 올리면 자동으로 재개됩니다)'
        );
        return;
      }
      const pace = 11 + (6 - c.difficulty) * 2;
      setNegotiationMeter((m) => {
        const next = m + pace;
        if (next >= 100) {
          const pts = 48 + c.difficulty * 22;
          addSimulationPoints(pts);
          setTickLine(`긍정 유치 성공 · 계약 체결 +${pts}P`);
          return 0;
        }
        setTickLine(`협상 진행 중 — 이번 턴 +${pace}% (조건 충족)`);
        return next;
      });
    }, NEGOTIATION_TICK_MS);
    return () => window.clearInterval(id);
  }, [customer]);

  const requirementsMet = useMemo(
    () => areSimulationRequirementsMet(customer.requirements, counts),
    [customer.requirements, counts]
  );

  return (
    <>
      <header className="manager-header">
        <div className="header-content">
          <div className="header-left">
            <h1>시뮬레이션</h1>
            <p>
              <strong>방치형 경영 시뮬</strong> 방식입니다.{' '}
              <strong>Game Dev Story</strong>의 스탯 요구·개발 진행처럼,{' '}
              <strong>FM</strong>의 스카우트 조건처럼, AI 고객마다{' '}
              <strong>특정 스킬을 일정 단계 이상</strong> 갖춰야만{' '}
              <strong>긍정 유치(계약 성사)</strong> 게이지가 진행됩니다. 조건을
              못 맞추면 게이지가 깎입니다. 고객은 2시간마다 교체됩니다.
            </p>
          </div>
        </div>
      </header>

      <div className="agent-simulation-page agent-simulation-page--gds">
        <div className="agent-simulation-simbar">
          <span className="agent-simulation-simbar__brand">방치형 · 고객 유치</span>
          <span className="agent-simulation-simbar__points">
            시뮬 적립{' '}
            <strong>{simPoints.toLocaleString('ko-KR')}P</strong>
          </span>
        </div>

        <section className="agent-simulation-customer agent-simulation-customer--gds">
          <div className="agent-simulation-customer__head">
            <h2 className="agent-simulation-customer__title">
              이번 시즌 타깃 고객
            </h2>
            <div className="agent-simulation-customer__meta">
              <span
                className="agent-simulation-difficulty"
                data-level={customer.difficulty}
              >
                협상 난이도 <strong>{customer.difficultyLabel}</strong>
                <span className="agent-simulation-difficulty__stars" aria-hidden>
                  {'★'.repeat(customer.difficulty)}
                  <span className="agent-simulation-difficulty__dim">
                    {'★'.repeat(5 - customer.difficulty)}
                  </span>
                </span>
              </span>
              <span className="agent-simulation-countdown" role="timer">
                다음 시장(고객)까지{' '}
                <strong>{formatRemainingShort(remainingMs)}</strong>
                <span className="agent-simulation-countdown__sub">
                  (약 {Math.round(remainingMs / 60000)}분 · 주기{' '}
                  {CUSTOMER_ROTATION_MS / 3600000}시간)
                </span>
              </span>
            </div>
          </div>
          <div className="agent-simulation-customer__card">
            <p className="agent-simulation-customer__name">{customer.displayName}</p>
            <p className="agent-simulation-customer__tag">
              AI 생성 프로필 (데모)
            </p>
            <dl className="agent-simulation-customer__dl">
              <div>
                <dt>이슈</dt>
                <dd>{customer.concern}</dd>
              </div>
              <div>
                <dt>유치 목표</dt>
                <dd>{customer.goal}</dd>
              </div>
              <div>
                <dt>성향</dt>
                <dd>{customer.tone}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section
          className="agent-simulation-req"
          aria-labelledby="sim-req-heading"
        >
          <div className="agent-simulation-req__head">
            <h2 id="sim-req-heading" className="agent-simulation-req__title">
              유치 조건 (필수 스킬)
            </h2>
            <span
              className={`agent-simulation-req__gate${requirementsMet ? ' is-open' : ' is-locked'}`}
            >
              {requirementsMet ? '조건 충족 · 협상 가능' : '조건 미충족'}
            </span>
          </div>
          <p className="agent-simulation-req__lead">
            아래 스킬이 각각 <strong>요구 단계 이상</strong>이어야 긍정 유치
            게이지가 쌓입니다. 대시보드 미션으로 스킬 단계를 올리세요.
          </p>
          <div className="agent-simulation-req-table-wrap">
            <table className="agent-simulation-req-table">
              <thead>
                <tr>
                  <th scope="col">스킬</th>
                  <th scope="col">요구 단계</th>
                  <th scope="col">내 단계</th>
                  <th scope="col">판정</th>
                </tr>
              </thead>
              <tbody>
                {customer.requirements.length ? (
                  customer.requirements.map((r) => {
                    const cur = getSkillStep(r.skillId, counts);
                    const ok = cur >= r.minStep;
                    return (
                      <tr key={r.skillId}>
                        <td>{r.skillName}</td>
                        <td>
                          {r.minStep}/{SKILL_PROGRESS_MAX}
                        </td>
                        <td>
                          {cur}/{SKILL_PROGRESS_MAX}
                        </td>
                        <td>
                          <span
                            className={`agent-simulation-req-ok${ok ? ' is-pass' : ' is-fail'}`}
                          >
                            {ok ? 'OK' : '부족'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="agent-simulation-req-table__empty">
                      스킬 데이터 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="agent-simulation-neg" aria-label="긍정 유치 진행">
          <div className="agent-simulation-neg__head">
            <h2 className="agent-simulation-neg__title">긍정 유치 협상</h2>
            <span className="agent-simulation-neg__hint">
              {Math.round(negotiationMeter)}%
            </span>
          </div>
          <div
            className="agent-simulation-neg-meter"
            role="progressbar"
            aria-valuenow={Math.round(negotiationMeter)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="긍정 유치 협상 진행률"
          >
            <div
              className="agent-simulation-neg-meter__fill"
              style={{ width: `${Math.min(100, negotiationMeter)}%` }}
            />
          </div>
          <p className="agent-simulation-neg__status" role="status">
            {tickLine ||
              (requirementsMet
                ? `약 ${NEGOTIATION_TICK_MS / 1000}초마다 자동 턴이 진행됩니다.`
                : '요구 스킬을 채우면 협상이 시작됩니다.')}
          </p>
        </section>
      </div>
    </>
  );
}
