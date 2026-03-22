import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgentDashboard from './pages/agent/AgentDashboard';

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-03-22T12:00:00+09:00'));
});

afterAll(() => {
  jest.useRealTimers();
});

test('renders points, chart section, and apply button', () => {
  render(<AgentDashboard />);
  expect(screen.getByRole('heading', { name: /^대시보드$/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /보유 포인트/i })).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: /오늘의 미션 · 선정 현황/i })
  ).toBeInTheDocument();
  expect(
    screen.getAllByRole('button', { name: /우수사례 신청/i }).length
  ).toBeGreaterThanOrEqual(1);
  expect(
    screen.getByRole('heading', { level: 3, name: /^오늘의 미션$/ })
  ).toBeInTheDocument();
});

test('compact row opens detail with selection reason', async () => {
  render(<AgentDashboard />);
  await userEvent.click(
    screen.getByRole('button', { name: /해지 의사 고객 장기 유지/i })
  );
  expect(screen.getByRole('heading', { name: /상세 내역/i })).toBeInTheDocument();
  expect(screen.getByText(/등록하신 정보/i)).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: /^선정 사유$/i })
  ).toBeInTheDocument();
});
