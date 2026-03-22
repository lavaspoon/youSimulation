import { useState } from 'react';

const queue = [
  {
    id: 1,
    name: '최상담',
    team: '4실',
    product: '인터넷+BTV',
    date: '2025-03-20',
    score: 92,
  },
  {
    id: 2,
    name: '정상담',
    team: '1실',
    product: '인터넷',
    date: '2025-03-19',
    score: 88,
  },
  {
    id: 3,
    name: '한상담',
    team: '2실',
    product: 'BTV',
    date: '2025-03-18',
    score: 71,
  },
];

export default function ManagerReview() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(queue[0]);

  const list =
    filter === 'high'
      ? queue.filter((q) => q.score >= 85)
      : filter === 'pending'
        ? queue
        : queue;

  return (
    <>
      <header className="manager-header">
        <div className="header-content">
          <div className="header-left">
            <h1>우수콜 심사</h1>
            <p>AI순 정렬 · 최종은 녹취 후</p>
          </div>
        </div>
      </header>

      <div className="review-hint-banner review-hint-banner--compact" role="note">
        녹취 후 최종 · AI는 보조
      </div>

      <div className="review-filter-tabs">
        <button
          type="button"
          className={`filter-btn${filter === 'all' ? ' active' : ''}`}
          onClick={() => setFilter('all')}
        >
          전체
        </button>
        <button
          type="button"
          className={`filter-btn${filter === 'high' ? ' active' : ''}`}
          onClick={() => setFilter('high')}
        >
          AI 고점수
        </button>
        <button
          type="button"
          className={`filter-btn${filter === 'pending' ? ' active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          미처리
        </button>
      </div>

      <div className="team-performance-table">
        <table>
          <thead>
            <tr>
              <th>상담사</th>
              <th>소속 실</th>
              <th>상품</th>
              <th>신청일</th>
              <th>AI 점수</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr
                key={row.id}
                className={`team-row${selected?.id === row.id ? ' selected' : ''}`}
                onClick={() => setSelected(row)}
              >
                <td className="team-name">{row.name}</td>
                <td>{row.team}</td>
                <td>{row.product}</td>
                <td>{row.date}</td>
                <td className="nudge-rate">{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="trend-chart-card" style={{ marginTop: '1.5rem' }}>
          <div className="chart-header">{selected.name}</div>
          <p className="panel-muted-tight">사유 · AI요약 · 키워드</p>
          <div className="keyword-tags">
            {['공감', '경청', '업셀'].map((k) => (
              <span key={k} className="keyword-tag">
                {k}
              </span>
            ))}
          </div>
          <div className="primary-cta-row" style={{ marginTop: '1.25rem' }}>
            <button type="button" className="btn-primary-action">
              승인
            </button>
            <button type="button" className="btn-secondary-action">
              보완 요청
            </button>
            <button type="button" className="btn-secondary-action">
              반려
            </button>
          </div>
        </div>
      )}
    </>
  );
}
