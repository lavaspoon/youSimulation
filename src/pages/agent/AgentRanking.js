const top = [
  { name: '이상담', dept: '1실', score: '6건' },
  { name: '박상담', dept: '3실', score: '5건' },
  { name: '김상담', dept: '2실', score: '5건' },
];

export default function AgentRanking() {
  return (
    <>
      <header className="manager-header">
        <div className="header-content">
          <div className="header-left">
            <h1>리그</h1>
            <p>실 · 센터 · 라이벌 · 시즌</p>
          </div>
        </div>
      </header>

      <section className="rankings-section">
        <div className="section-title">
          <span className="title-indicator" aria-hidden />
          <div>
            <h2>우리 실</h2>
            <span className="section-subtitle">샘플</span>
          </div>
        </div>
        <div className="rankings-grid">
          <div className="ranking-card">
            <span className="ranking-badge nudge-badge">2실</span>
            <div className="ranking-list" style={{ marginTop: '0.75rem' }}>
              {top.map((u, i) => (
                <div key={u.name} className="ranking-item">
                  <span className="ranking-position">{i + 1}</span>
                  <div className="ranking-info">
                    <div className="user-name">{u.name}</div>
                    <div className="user-dept">{u.dept}</div>
                  </div>
                  <span className="ranking-score">{u.score}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ranking-card">
            <span className="ranking-badge giga-badge">라이벌</span>
            <p className="ranking-blurb-tight">
              <strong>박상담</strong> +1업적 · 역전 62%
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
