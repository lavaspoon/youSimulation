export default function ManagerDashboard() {
  return (
    <>
      <header className="manager-header">
        <div className="header-content">
          <div className="header-left">
            <h1>센터 현황</h1>
            <p>참여 · 우수콜 · AI점수 · 실별</p>
          </div>
          <div className="header-right">
            <div className="manager-excel-download-section">
              <div className="manager-month-selector">
                <span className="manager-calendar-icon" aria-hidden>
                  📅
                </span>
                <select className="manager-month-select" aria-label="조회 월">
                  <option value="2025-03">2025년 3월</option>
                  <option value="2025-02">2025년 2월</option>
                </select>
              </div>
              <button type="button" className="manager-excel-download-btn">
                <span className="manager-btn-text">보내기</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="overview-grid">
        <div className="overview-card">
          <div className="card-header">전체 참여율</div>
          <div className="card-value">84%</div>
          <div className="card-trend positive">
            전월 대비 +3%
            <span className="growth-indicator up" data-tooltip="신규 미션 효과">
              <span className="growth-icon">↑</span>
            </span>
          </div>
        </div>
        <div className="overview-card">
          <div className="card-header">이달 우수콜</div>
          <div className="card-value">127</div>
          <div className="card-trend">건</div>
        </div>
        <div className="overview-card">
          <div className="card-header">평균 AI 사전 점수</div>
          <div className="card-value">71</div>
          <div className="card-trend">0~100 스케일</div>
        </div>
        <div className="overview-card">
          <div className="card-header">2달 이상 미신청</div>
          <div className="card-value">6</div>
          <div className="card-trend negative">슬럼프 알림 대상</div>
        </div>
      </div>

      <div className="section-title">
        <span className="title-indicator" aria-hidden />
        <div>
          <h2>실별 누적</h2>
          <span className="section-subtitle">샘플</span>
        </div>
      </div>
      <div className="trend-chart-card">
        <div className="chart-header">이달</div>
        <div
          className="chart-container chart-container--short"
          style={{
            height: 140,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            gap: '1rem',
            padding: '0 1rem',
          }}
        >
          {[40, 65, 52, 78, 45].map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                maxWidth: 56,
                height: `${h}%`,
                background:
                  'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
                borderRadius: '8px 8px 0 0',
                opacity: 0.85,
              }}
              title={`실 ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
