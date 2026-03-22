import { NavLink, Outlet } from 'react-router-dom';

const agentNav = [
  { to: '/agent/dashboard', label: '대시보드' },
  { to: '/agent/skills', label: '나의 스킬' },
  { to: '/agent/simulation', label: '시뮬레이션' },
];

const managerNav = [
  { to: '/manager/dashboard', label: '센터' },
  { to: '/manager/review', label: '심사' },
  { to: '/manager/missions', label: '퀘스트 풀' },
  { to: '/manager/skills', label: '성장 설계' },
  { to: '/manager/challenge', label: '월간 시나리오' },
];

export default function AppLayout({ role }) {
  const items = role === 'manager' ? managerNav : agentNav;
  const title = role === 'manager' ? '운영' : '육성';
  const subtitle =
    role === 'manager'
      ? '센터 · 퀘스트 · 보상'
      : '방치형 · 바쁠수록 짧게';

  return (
    <div className="manager-dashboard">
      <div className="manager-container">
        <div className="app-shell">
          <aside className="app-sidebar" aria-label="주 메뉴">
            <div className="app-sidebar-brand">
              <strong>{title}</strong>
              <span>{subtitle}</span>
            </div>
            <div className="app-nav-section">메뉴</div>
            {items.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `app-nav-link${isActive ? ' active' : ''}`
                }
                end={to.endsWith('dashboard')}
              >
                {label}
              </NavLink>
            ))}
            <div className="app-nav-section" style={{ marginTop: 'auto' }}>
              전환
            </div>
            <NavLink
              to={role === 'manager' ? '/agent/dashboard' : '/manager/dashboard'}
              className="app-nav-link"
            >
              {role === 'manager' ? '상담사' : '관리자'}
            </NavLink>
          </aside>
          <main className="app-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
