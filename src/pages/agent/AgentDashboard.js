import { useEffect, useMemo, useState } from 'react';
import AgentAiTodayMissions from '../../components/AgentAiTodayMissions';
import AgentMonthlyLineChart from '../../components/AgentMonthlyLineChart';
import ApplyExcellentModal from '../../components/ApplyExcellentModal';
import SelectionDetailModal from '../../components/SelectionDetailModal';
import {
  buildYearChartSeries,
  CHART_YEAR_MAX,
  CHART_YEAR_MIN,
  findHistoryBlock,
} from '../../data/agentDashboardHistory';
import { getResolvedTodayMissions } from '../../data/agentTodayMissions';
import { adjustSkillStepsForMission } from '../../data/agentSkillProgressStore';
import {
  AGENT_SIMULATION_CHANGED,
  getSimulationPoints,
} from '../../data/agentSimulationStore';
import { SKILL_TREE_CHANGED } from '../../data/skillTreeStore';

/** 데모: 실제 연동 시 API에서 월별 집계·목록 */
const POINTS_BASE = 4280;

const AGENT_PROFILE = {
  displayName: '김상담',
  orgLine: '강남센터 · 2실',
  avatarLetter: '김',
};

const LIST_PREVIEW_COUNT = 2;

function MonthItemsList({ items, onOpenDetail }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > LIST_PREVIEW_COUNT;
  const shown = expanded ? items : items.slice(0, LIST_PREVIEW_COUNT);
  const hidden = items.length - LIST_PREVIEW_COUNT;

  if (items.length === 0) {
    return (
      <p className="agent-month-empty agent-month-empty--tight">내역 없음</p>
    );
  }

  return (
    <>
      <ul className="agent-compact-list agent-compact-list--tight">
        {shown.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="agent-compact-row agent-compact-row--tight"
              onClick={() => onOpenDetail(item)}
            >
              <span className="agent-compact-date">{item.date}</span>
              <span className="agent-compact-title">{item.titleShort}</span>
              <span className="agent-compact-meta">{item.product}</span>
              <span
                className={
                  item.status === 'selected'
                    ? 'agent-compact-badge agent-compact-badge--ok'
                    : 'agent-compact-badge agent-compact-badge--no'
                }
              >
                {item.status === 'selected' ? '선정' : '미선정'}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {hasMore ? (
        <button
          type="button"
          className="agent-month-more-btn"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? '접기' : `더보기 (${hidden}건)`}
        </button>
      ) : null}
    </>
  );
}

export default function AgentDashboard() {
  const [applyOpen, setApplyOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [missionPicked, setMissionPicked] = useState({});
  const [todayMissions, setTodayMissions] = useState(() =>
    getResolvedTodayMissions()
  );
  const [simulationPoints, setSimulationPoints] = useState(() =>
    getSimulationPoints()
  );
  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    const sync = () => setTodayMissions(getResolvedTodayMissions());
    window.addEventListener(SKILL_TREE_CHANGED, sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener(SKILL_TREE_CHANGED, sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  useEffect(() => {
    const syncSim = () => setSimulationPoints(getSimulationPoints());
    window.addEventListener(AGENT_SIMULATION_CHANGED, syncSim);
    window.addEventListener('focus', syncSim);
    return () => {
      window.removeEventListener(AGENT_SIMULATION_CHANGED, syncSim);
      window.removeEventListener('focus', syncSim);
    };
  }, []);

  const pointsBalance = POINTS_BASE + simulationPoints;
  const [chartYear, setChartYear] = useState(() =>
    Math.min(
      CHART_YEAR_MAX,
      Math.max(CHART_YEAR_MIN, new Date().getFullYear())
    )
  );
  /** 차트에서 고른 월·연 (null이면 우측은 시스템 '이번 달') */
  const [focusYm, setFocusYm] = useState(null);

  const toggleMission = (id) => {
    setMissionPicked((prev) => {
      const nextOn = !prev[id];
      const mission = todayMissions.find((m) => m.id === id);
      const sids = mission?.linkedSkills?.map((s) => s.id) ?? [];
      if (sids.length) {
        adjustSkillStepsForMission(sids, nextOn ? 1 : -1);
      }
      return { ...prev, [id]: nextOn };
    });
  };

  const linkedMissions = todayMissions.filter((m) => missionPicked[m.id]);

  const chartSeries = useMemo(
    () => buildYearChartSeries(chartYear),
    [chartYear]
  );

  const calendarYm = useMemo(
    () => ({ year: now.getFullYear(), month: now.getMonth() + 1 }),
    [now]
  );

  const listYm = focusYm ?? calendarYm;
  const listBlock = findHistoryBlock(listYm.year, listYm.month);

  const selectedChartMonth =
    focusYm && focusYm.year === chartYear ? focusYm.month : null;

  const handleYearStep = (delta) => {
    const next = chartYear + delta;
    if (next < CHART_YEAR_MIN || next > CHART_YEAR_MAX) return;
    setChartYear(next);
    setFocusYm(null);
  };

  const handleChartMonthClick = (month) => {
    setFocusYm((f) =>
      f && f.year === chartYear && f.month === month
        ? null
        : { year: chartYear, month }
    );
  };

  return (
    <div className="agent-excellent-home">
      <div className="agent-excellent-toolbar">
        <div className="agent-excellent-toolbar__left">
          <h1 className="agent-excellent-title">대시보드</h1>
          <div
            className="agent-dashboard-profile"
            aria-label={`${AGENT_PROFILE.displayName}, ${AGENT_PROFILE.orgLine}`}
          >
            <div className="agent-dashboard-profile__avatar" aria-hidden="true">
              {AGENT_PROFILE.avatarLetter}
            </div>
            <div className="agent-dashboard-profile__identity">
              <p className="agent-dashboard-profile__name">
                {AGENT_PROFILE.displayName}
              </p>
              <p className="agent-dashboard-profile__org">{AGENT_PROFILE.orgLine}</p>
            </div>
            <div className="agent-dashboard-profile__divider" aria-hidden="true" />
            <div
              className="agent-dashboard-profile__points"
              aria-labelledby="dashboard-profile-points-heading"
            >
              <h2
                id="dashboard-profile-points-heading"
                className="agent-dashboard-profile__points-label"
              >
                보유 포인트
              </h2>
              <p className="agent-dashboard-profile__points-value">
                {pointsBalance.toLocaleString('ko-KR')}
                <span className="agent-dashboard-profile__points-unit">P</span>
              </p>
              <p className="agent-dashboard-profile__points-note">
                기본 잔액 + 시뮬레이션 적립 (데모)
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="agent-unified-section" aria-labelledby="dashboard-hub-heading">
        <div className="agent-home-combined-panel">
          <h2 id="dashboard-hub-heading" className="agent-panel-unified-title">
            오늘의 미션 · 선정 현황
          </h2>
          <p className="agent-panel-unified-lead">
            미션을 선택하면 <strong>연결 스킬</strong> 숙련도에 반영됩니다. 차트의{' '}
            <strong>월</strong>을 누르면 우측 내역이 그 달로 바뀌고, 같은 월을 다시 누르면
            이번 달로 돌아옵니다.
          </p>
          <div className="agent-mission-session-card">
            <AgentAiTodayMissions
              embedded
              missions={todayMissions}
              picked={missionPicked}
              onToggle={toggleMission}
              onApply={() => setApplyOpen(true)}
            />
          </div>
          <hr className="agent-home-combined-split" />
          <div className="agent-unified-stats">
            <h3
              id="monthly-stats-heading"
              className="agent-unified-stats__title"
            >
              월별 선정 건수 · 신청·심사 내역
            </h3>
            <div
              className="agent-unified-row agent-unified-row--combined"
              aria-labelledby="monthly-stats-heading"
            >
              <div className="agent-unified-chart-col">
                <div className="agent-chart-year-nav">
                  <button
                    type="button"
                    className="agent-chart-year-nav__btn"
                    onClick={() => handleYearStep(-1)}
                    disabled={chartYear <= CHART_YEAR_MIN}
                    aria-label="이전 연도"
                  >
                    ‹
                  </button>
                  <span className="agent-chart-year-nav__label">{chartYear}년</span>
                  <button
                    type="button"
                    className="agent-chart-year-nav__btn"
                    onClick={() => handleYearStep(1)}
                    disabled={chartYear >= CHART_YEAR_MAX}
                    aria-label="다음 연도"
                  >
                    ›
                  </button>
                </div>
                <div className="agent-recharts-host">
                  <AgentMonthlyLineChart
                    data={chartSeries}
                    selectedMonth={selectedChartMonth}
                    onMonthClick={handleChartMonthClick}
                  />
                </div>
                <p className="agent-chart-hint">월 재클릭 시 이번 달 보기로 복귀</p>
                <div className="agent-unified-chart-spacer" aria-hidden="true" />
              </div>
              <div className="agent-unified-list-col">
                <h3 className="agent-list-month-head__title">
                  {listYm.year}년 {listYm.month}월
                </h3>
                <MonthItemsList
                  items={listBlock.items}
                  onOpenDetail={setDetailRecord}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ApplyExcellentModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        linkedMissions={linkedMissions}
      />
      <SelectionDetailModal
        open={Boolean(detailRecord)}
        onClose={() => setDetailRecord(null)}
        record={detailRecord}
      />
    </div>
  );
}
