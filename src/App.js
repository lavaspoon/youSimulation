import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import AgentChallenge from './pages/agent/AgentChallenge';
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentMissions from './pages/agent/AgentMissions';
import AgentRanking from './pages/agent/AgentRanking';
import AgentSkillTree from './pages/agent/AgentSkillTree';
import ManagerChallengeReg from './pages/manager/ManagerChallengeReg';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerMissionsPool from './pages/manager/ManagerMissionsPool';
import ManagerReview from './pages/manager/ManagerReview';
import ManagerSkillAdmin from './pages/manager/ManagerSkillAdmin';
import './example.css';
import './screens.css';

function App() {
  return (
    <BrowserRouter
      future={{
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/agent/dashboard" replace />} />
        <Route path="/agent" element={<AppLayout role="agent" />}>
          <Route path="dashboard" element={<AgentDashboard />} />
          <Route path="skills" element={<AgentSkillTree />} />
          <Route path="simulation" element={<AgentChallenge />} />
          <Route
            path="challenge"
            element={<Navigate to="/agent/simulation" replace />}
          />
          <Route path="missions" element={<AgentMissions />} />
          <Route path="ranking" element={<AgentRanking />} />
        </Route>
        <Route path="/manager" element={<AppLayout role="manager" />}>
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="review" element={<ManagerReview />} />
          <Route path="missions" element={<ManagerMissionsPool />} />
          <Route path="skills" element={<ManagerSkillAdmin />} />
          <Route path="challenge" element={<ManagerChallengeReg />} />
        </Route>
        <Route path="*" element={<Navigate to="/agent/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
