import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Empty } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  PieChartOutlined,
  WalletOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getDashboardBalance } from '../api/client';

const { Title } = Typography;

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96'];

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getDashboardBalance();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!data) return null;

  const pieData = data.accounts
    .filter((a) => a.total_assets > 0)
    .map((a) => ({
      name: a.account_name,
      value: Math.round(a.total_assets * 100) / 100,
    }));

  const columns = [
    { title: 'Account', dataIndex: 'account_name', key: 'name' },
    {
      title: 'Type',
      dataIndex: 'account_type',
      key: 'type',
      render: (type) => {
        const colorMap = { bank: 'blue', broker: 'purple', transport: 'green' };
        const labelMap = { bank: 'Bank', broker: 'Broker', transport: 'Transport' };
        return <Tag color={colorMap[type]}>{labelMap[type]}</Tag>;
      },
    },
    { title: 'Currency', dataIndex: 'currency', key: 'currency' },
    {
      title: 'Deposit',
      dataIndex: 'total_deposit',
      key: 'deposit',
      render: (v) => <span style={{ color: '#52c41a', fontWeight: 500 }}>+{v.toFixed(2)}</span>,
    },
    {
      title: 'Liability',
      dataIndex: 'total_liability',
      key: 'liability',
      render: (v) => <span style={{ color: '#f5222d', fontWeight: 500 }}>-{v.toFixed(2)}</span>,
    },
    {
      title: 'Net Balance',
      dataIndex: 'net_balance',
      key: 'net',
      render: (v) => <strong>{v.toFixed(2)}</strong>,
    },
    {
      title: 'Stock Value',
      dataIndex: 'stock_value',
      key: 'stock',
      render: (v) => v.toFixed(2),
    },
    {
      title: 'Total Assets',
      dataIndex: 'total_assets',
      key: 'assets',
      render: (v) => <strong style={{ color: '#1677ff' }}>{v.toFixed(2)}</strong>,
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        <DashboardOutlined style={{ marginRight: 8 }} />
        Dashboard
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Deposit"
              value={data.total_deposit}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Liability"
              value={data.total_liability}
              precision={2}
              valueStyle={{ color: '#f5222d' }}
              prefix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Net Balance"
              value={data.net_balance}
              precision={2}
              valueStyle={{ color: '#1677ff' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Assets"
              value={data.total_assets}
              precision={2}
              valueStyle={{ color: '#722ed1' }}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card title="Account Balances" bodyStyle={{ padding: 0 }}>
            {data.accounts.length === 0 ? (
              <Empty description="No accounts yet" style={{ padding: 40 }} />
            ) : (
              <Table
                dataSource={data.accounts}
                columns={columns}
                rowKey="account_id"
                pagination={false}
                size="middle"
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Asset Distribution">
            {pieData.length === 0 ? (
              <Empty description="No data" style={{ padding: 40 }} />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip formatter={(value) => value.toFixed(2)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
