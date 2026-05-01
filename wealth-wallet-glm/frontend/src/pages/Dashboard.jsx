import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Avatar } from 'antd';
import {
  AccountBookOutlined,
  DollarOutlined,
  RiseOutlined,
  FundProjectionScreenOutlined,
  BankOutlined,
  StockOutlined,
  CreditCardOutlined,
  WalletOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { getDashboardSummary, getAccountsBalance } from '../services/api';

const currencyMap = { CNY: '¥', USD: '$', HKD: 'HK$' };
const accountTypeMap = { bank: '银行账户', brokerage: '券商账户', transit: '交通卡' };
const accountTypeColor = { bank: '#1677ff', brokerage: '#52c41a', transit: '#fa8c16' };
const accountTypeIcon = { bank: <BankOutlined />, brokerage: <StockOutlined />, transit: <CreditCardOutlined /> };

const PIE_COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a'];

const EXCHANGE_RATES = { CNY: 1, USD: 7.24, HKD: 0.93 };

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [s, a] = await Promise.all([getDashboardSummary(), getAccountsBalance()]);
      setSummary(s);
      setAccounts(a);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Build pie chart data - all converted to CNY equivalent
  const pieData = accounts
    .filter(a => a.balance > 0)
    .map(a => ({
      name: a.name,
      value: Math.round(a.balance * EXCHANGE_RATES[a.currency] * 100) / 100,
      currency: a.currency,
      rawBalance: a.balance,
      type: a.account_type,
    }));

  const totalCnyEquiv = pieData.reduce((sum, d) => sum + d.value, 0);

  const customPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{
          background: '#fff',
          borderRadius: 8,
          padding: '10px 14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          border: '1px solid #f0f0f0',
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.name}</div>
          <div style={{ color: '#8c8c8c', fontSize: 12 }}>
            {currencyMap[d.currency]}{d.rawBalance.toLocaleString()} {d.currency}
          </div>
          <div style={{ color: '#52c41a', fontSize: 13, fontWeight: 600, marginTop: 2 }}>
            ≈ ¥{d.value.toLocaleString()} CNY
          </div>
          <div style={{ color: '#8c8c8c', fontSize: 11, marginTop: 2 }}>
            占比 {((d.value / totalCnyEquiv) * 100).toFixed(1)}%
          </div>
        </div>
      );
    }
    return null;
  };

  const columns = [
    {
      title: '账户名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate(`/accounts/${record.id}`)}>
          <Avatar
            size={32}
            style={{
              background: accountTypeColor[record.account_type],
              borderRadius: 8,
              fontSize: 14,
            }}
            icon={accountTypeIcon[record.account_type]}
          />
          <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{text}</span>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'account_type',
      key: 'account_type',
      render: (type) => (
        <Tag
          color={accountTypeColor[type]}
          className="account-tag"
          icon={accountTypeIcon[type]}
        >
          {accountTypeMap[type]}
        </Tag>
      ),
    },
    {
      title: '币种',
      dataIndex: 'currency',
      key: 'currency',
      render: (c) => <span style={{ color: '#8c8c8c' }}>{currencyMap[c]} {c}</span>,
    },
    {
      title: '存款',
      dataIndex: 'total_deposits',
      key: 'total_deposits',
      render: (v, r) => <span style={{ color: '#52c41a' }}>{currencyMap[r.currency]}{v.toLocaleString()}</span>,
    },
    {
      title: '负债',
      dataIndex: 'total_liabilities',
      key: 'total_liabilities',
      render: (v, r) => <span style={{ color: '#ff4d4f' }}>{currencyMap[r.currency]}{v.toLocaleString()}</span>,
    },
    {
      title: '股票市值',
      dataIndex: 'stock_market_value',
      key: 'stock_market_value',
      render: (v, r) => v > 0 ? <span style={{ color: '#1677ff', fontWeight: 600 }}>{currencyMap[r.currency]}{v.toLocaleString()}</span> : <span style={{ color: '#d9d9d9' }}>-</span>,
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      render: (v, r) => (
        <span className={v >= 0 ? 'balance-positive' : 'balance-negative'}>
          {currencyMap[r.currency]}{v.toLocaleString()}
        </span>
      ),
    },
  ];

  const gradientCards = [
    {
      title: '人民币总资产',
      value: summary?.total_cny || 0,
      prefix: '¥',
      suffix: 'CNY',
      icon: <AccountBookOutlined />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: '美元总资产',
      value: summary?.total_usd || 0,
      prefix: '$',
      suffix: 'USD',
      icon: <DollarOutlined />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      title: '港元总资产',
      value: summary?.total_hkd || 0,
      prefix: 'HK$',
      suffix: 'HKD',
      icon: <DollarOutlined />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  ];

  return (
    <div>
      {/* Page Title */}
      <div className="page-title">
        <div className="title-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <FundProjectionScreenOutlined />
        </div>
        <div>
          <h2>财务概览</h2>
          <div className="subtitle">Financial Overview</div>
        </div>
      </div>

      {/* Gradient Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {gradientCards.map((card, i) => (
          <Col span={8} key={i}>
            <Card
              loading={loading}
              className="gradient-card stat-card"
              style={{ background: card.gradient, border: 'none' }}
              bodyStyle={{ padding: '20px 24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Statistic
                    title={card.title}
                    value={card.value}
                    precision={2}
                    prefix={card.prefix}
                    suffix={card.suffix}
                    valueStyle={{ fontSize: 26, fontWeight: 700 }}
                  />
                </div>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  color: '#fff',
                }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Total CNY Equivalent - highlight card */}
      <Row style={{ marginBottom: 20 }}>
        <Col span={24}>
          <Card
            loading={loading}
            className="gradient-card stat-card"
            style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', border: 'none' }}
            bodyStyle={{ padding: '24px 32px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Statistic
                  title="折合人民币总资产"
                  value={summary?.total_cny_equivalent || 0}
                  prefix="¥"
                  precision={2}
                  suffix="元"
                  valueStyle={{ fontSize: 38, fontWeight: 800 }}
                />
              </div>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                color: '#fff',
                boxShadow: '0 4px 12px rgba(240, 147, 251, 0.4)',
              }}>
                <RiseOutlined />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Pie Chart + Account Table */}
      <Row gutter={[20, 20]}>
        <Col span={10}>
          <Card
            loading={loading}
            style={{ borderRadius: 12, border: '1px solid #f0f0f0', height: '100%' }}
            bodyStyle={{ padding: '16px 20px' }}
          >
            <div className="section-header">
              <h3><PieChartOutlined style={{ marginRight: 8, color: '#764ba2' }} />账户资产占比</h3>
            </div>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={380}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    innerRadius={60}
                    dataKey="value"
                    labelLine={false}
                    label={customPieLabel}
                    paddingAngle={2}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ color: '#595959', fontSize: 12 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 80, color: '#bfbfbf' }}>
                <PieChartOutlined style={{ fontSize: 48, marginBottom: 12, display: 'block' }} />
                暂无账户数据
              </div>
            )}
          </Card>
        </Col>

        <Col span={14}>
          <Card
            loading={loading}
            style={{ borderRadius: 12, border: '1px solid #f0f0f0' }}
            bodyStyle={{ padding: '16px 20px' }}
          >
            <div className="section-header">
              <h3><WalletOutlined style={{ marginRight: 8, color: '#1677ff' }} />各账户余额</h3>
            </div>
            <Table
              columns={columns}
              dataSource={accounts}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="middle"
              style={{ cursor: 'pointer' }}
              onRow={(record) => ({
                onClick: () => navigate(`/accounts/${record.id}`),
                style: { cursor: 'pointer' },
              })}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
