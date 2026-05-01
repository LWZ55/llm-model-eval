import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar } from 'antd';
import {
  DashboardOutlined,
  WalletOutlined,
  FundOutlined,
  BankOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/accounts', icon: <WalletOutlined />, label: '账户管理' },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = location.pathname.startsWith('/accounts')
    ? '/accounts'
    : location.pathname;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={220}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%)',
        }}
      >
        {/* Logo area */}
        <div style={{
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          margin: '0 16px',
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color: '#fff',
          }}>
            <FundOutlined />
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 17, fontWeight: 700, lineHeight: '22px' }}>财富钱包</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, lineHeight: '16px' }}>Wealth Wallet</div>
          </div>
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderRight: 'none',
            marginTop: 8,
          }}
        />

        {/* Bottom section */}
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: 0,
          right: 0,
          padding: '0 20px',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <Avatar
              size={36}
              style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', flexShrink: 0 }}
            >
              U
            </Avatar>
            <div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>用户</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>个人版</div>
            </div>
          </div>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 220, background: '#f0f2f5' }}>
        <Header style={{
          background: 'linear-gradient(90deg, #1a1a3e 0%, #24243e 50%, #302b63 100%)',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          lineHeight: '56px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BankOutlined style={{ color: '#667eea', fontSize: 18 }} />
            <span style={{ color: '#fff', fontSize: 15, fontWeight: 600, letterSpacing: 1 }}>
              财富管理平台
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </Header>

        <Content style={{
          margin: 20,
          padding: 0,
          minHeight: 'calc(100vh - 96px)',
          background: 'transparent',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
