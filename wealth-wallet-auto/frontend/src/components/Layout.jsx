import { Link, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button } from 'antd';
import {
  DashboardOutlined,
  WalletOutlined,
  BulbOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

const { Header, Content } = AntLayout;

export default function Layout({ children }) {
  const location = useLocation();
  const [dark, setDark] = useState(false);

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
    { key: '/accounts', icon: <WalletOutlined />, label: <Link to="/accounts">Accounts</Link> },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh', background: dark ? '#141414' : 'var(--bg)' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          background: dark ? '#1f1f1f' : '#fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          borderBottom: `1px solid ${dark ? '#333' : 'var(--border)'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #722ed1, #b37feb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              W
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: dark ? '#fff' : 'var(--text-h)' }}>
              Wealth Wallet
            </span>
          </Link>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{
              borderBottom: 'none',
              background: 'transparent',
              minWidth: 200,
            }}
            theme={dark ? 'dark' : 'light'}
          />
        </div>
        <Button
          type="text"
          icon={dark ? <BulbOutlined /> : <MoonOutlined />}
          onClick={() => setDark(!dark)}
          style={{ color: dark ? '#fff' : 'var(--text)' }}
        />
      </Header>
      <Content style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ color: dark ? '#fff' : undefined }}>{children}</div>
      </Content>
    </AntLayout>
  );
}
