import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Space, Typography } from 'antd';
import {
  WalletOutlined,
  DashboardOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

function Navbar() {
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/" style={{ textDecoration: 'none' }}>Dashboard</Link>,
    },
    {
      key: '/accounts',
      icon: <CreditCardOutlined />,
      label: <Link to="/accounts" style={{ textDecoration: 'none' }}>Accounts</Link>,
    },
  ];

  const selectedKey = location.pathname.startsWith('/accounts')
    ? '/accounts'
    : location.pathname;

  return (
    <Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        padding: '0 24px',
      }}
    >
      <Space size="small" style={{ marginRight: 32 }}>
        <WalletOutlined style={{ fontSize: 22, color: '#1677ff' }} />
        <Title level={4} style={{ margin: 0, color: '#1677ff' }}>
          Wealth Wallet
        </Title>
      </Space>

      <Menu
        mode="horizontal"
        selectedKeys={[selectedKey]}
        items={menuItems}
        style={{
          flex: 1,
          minWidth: 0,
          borderBottom: 'none',
        }}
      />
    </Header>
  );
}

export default Navbar;
