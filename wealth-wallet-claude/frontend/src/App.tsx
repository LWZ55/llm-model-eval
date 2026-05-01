import {
  DashboardOutlined,
  SettingOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AccountDetail from './pages/AccountDetail';
import Settings from './pages/Settings';

export default function App() {
  return (
    <div className="app">
      <nav className="nav">
        <Link to="/" className="brand">
          <span className="logo"><WalletOutlined /></span>
          <h1>Wealth Wallet</h1>
        </Link>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            <DashboardOutlined /> Dashboard
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
            <SettingOutlined /> Settings
          </NavLink>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/accounts/:id" element={<AccountDetail />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
}
