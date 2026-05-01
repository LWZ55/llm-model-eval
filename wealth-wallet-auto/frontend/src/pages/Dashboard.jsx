import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Statistic, Tag, Empty } from 'antd';
import {
  BankOutlined,
  StockOutlined,
  CreditCardOutlined,
  DollarOutlined,
  PieChartOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { getAccounts, getTotalBalance } from '../api/client';
import AccountPieChart from '../components/AccountPieChart';

const TYPE_CONFIG = {
  bank: { label: 'Bank', icon: <BankOutlined />, color: 'purple' },
  broker: { label: 'Broker', icon: <StockOutlined />, color: 'cyan' },
  transit: { label: 'Transit', icon: <CreditCardOutlined />, color: 'green' },
};

export default function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(null);

  useEffect(() => {
    getAccounts().then((res) => setAccounts(res.data));
    getTotalBalance().then((res) => setTotal(res.data));
  }, []);

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Balance"
              value={total?.total_balance ?? 0}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Stock Value"
              value={total?.total_stock_value ?? 0}
              precision={2}
              prefix={<StockOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Grand Total"
              value={total?.grand_total ?? 0}
              precision={2}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#52c41a', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Accounts"
              value={total?.account_count ?? 0}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <span style={{ fontWeight: 600 }}>
                <PieChartOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                Account Proportions
              </span>
            }
            bordered={false}
          >
            {accounts.length > 0 ? (
              <AccountPieChart accounts={accounts} />
            ) : (
              <Empty description="No account data" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={
              <span style={{ fontWeight: 600 }}>
                <BankOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                Quick Overview
              </span>
            }
            bordered={false}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {accounts.map((acc) => {
                const cfg = TYPE_CONFIG[acc.type];
                const grand = acc.balance + acc.stock_value;
                return (
                  <Link
                    key={acc.id}
                    to={`/accounts/${acc.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: 10,
                      background: 'var(--accent-light)',
                      border: '1px solid var(--accent-border)',
                      textDecoration: 'none',
                      transition: 'transform 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(4px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#722ed1',
                          fontSize: 18,
                        }}
                      >
                        {cfg.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-h)' }}>{acc.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text)' }}>
                          <Tag color={cfg.color} style={{ fontSize: 11, marginRight: 6 }}>
                            {cfg.label}
                          </Tag>
                          {acc.currency}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: 15 }}>
                        {grand.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text)' }}>
                        {acc.stock_value > 0 && `Stock: ${acc.stock_value.toFixed(2)}`}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {accounts.length === 0 && (
              <Empty style={{ marginTop: 24 }} description="No accounts yet">
                <Link to="/accounts">
                  <Tag color="purple" style={{ cursor: 'pointer', marginTop: 8 }}>
                    Create one
                  </Tag>
                </Link>
              </Empty>
            )}
          </Card>
        </Col>
      </Row>

      <h2 style={{ marginBottom: 16, fontSize: 20 }}>All Accounts</h2>
      <Row gutter={[16, 16]}>
        {accounts.map((acc) => {
          const cfg = TYPE_CONFIG[acc.type];
          return (
            <Col xs={24} sm={12} lg={8} key={acc.id}>
              <Link to={`/accounts/${acc.id}`} style={{ textDecoration: 'none' }}>
                <Card
                  bordered={false}
                  hoverable
                  style={{ borderRadius: 14 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: 'var(--accent-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#722ed1',
                          fontSize: 20,
                        }}
                      >
                        {cfg.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 15 }}>{acc.name}</div>
                        <Tag color={cfg.color} style={{ fontSize: 11, marginTop: 2 }}>{cfg.label}</Tag>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{acc.currency}</span>
                  </div>
                  <Row gutter={16}>
                    <Col span={acc.stock_value > 0 ? 12 : 24}>
                      <div style={{ fontSize: 12, color: 'var(--text)' }}>Balance</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: 18 }}>
                        {acc.balance.toFixed(2)}
                      </div>
                    </Col>
                    {acc.stock_value > 0 && (
                      <Col span={12}>
                        <div style={{ fontSize: 12, color: 'var(--text)' }}>Stock Value</div>
                        <div style={{ fontWeight: 700, color: '#13c2c2', fontSize: 18 }}>
                          {acc.stock_value.toFixed(2)}
                        </div>
                      </Col>
                    )}
                  </Row>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
