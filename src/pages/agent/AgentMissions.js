const rows = [
  ['일상', '동료 우수콜 3건 응원', '100P', '부담↓'],
  ['성장', '묶음 상품 포함 콜 신청', '150P', '주간 연계'],
  ['도전', '해지 방어 콜 신청', '250P', '휴식 시 쉬운 퀘↑'],
];

export default function AgentMissions() {
  return (
    <>
      <header className="manager-header">
        <div className="header-content">
          <div className="header-left">
            <h1>데일리</h1>
            <p>AI 배치 · 깨면 즉시 보상</p>
          </div>
        </div>
      </header>

      <div className="team-performance-table">
        <table>
          <thead>
            <tr>
              <th>등급</th>
              <th>퀘스트</th>
              <th>보상</th>
              <th>팁</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([d, m, p, n]) => (
              <tr key={m}>
                <td>{d}</td>
                <td style={{ textAlign: 'left' }}>{m}</td>
                <td>
                  <strong>{p}</strong>
                </td>
                <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  {n}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
