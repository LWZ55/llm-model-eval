import { Link, useLocation } from 'react-router-dom';
import { WalletOutlined, DashboardOutlined } from '@ant-design/icons';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="nav-logo"><WalletOutlined /></span>
          <span>Wealth Wallet</span>
        </Link>
        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <DashboardOutlined /> Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
