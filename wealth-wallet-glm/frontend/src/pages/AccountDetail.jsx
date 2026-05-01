import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Statistic, Tabs, Table, Button, Modal, Form, Input,
  InputNumber, Select, Space, message, Popconfirm, Tag, DatePicker, Avatar,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, ArrowUpOutlined, ArrowDownOutlined,
  BankOutlined, StockOutlined, CreditCardOutlined, ArrowLeftOutlined,
  FundOutlined, FallOutlined, RiseOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import dayjs from 'dayjs';
import {
  getAccount, getAccountBalance, getDeposits, createDeposit, deleteDeposit,
  getLiabilities, createLiability, deleteLiability,
  getHoldings, createHolding, updateHolding, deleteHolding,
  getSnapshots,
} from '../services/api';

const accountTypeMap = { bank: '银行账户', brokerage: '券商账户', transit: '交通卡' };
const currencyMap = { CNY: '¥', USD: '$', HKD: 'HK$' };
const accountTypeGradient = {
  bank: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  brokerage: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  transit: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
};
const accountTypeIcon = {
  bank: <BankOutlined />,
  brokerage: <StockOutlined />,
  transit: <CreditCardOutlined />,
};

const HOLDING_PIE_COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a'];

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [depModalOpen, setDepModalOpen] = useState(false);
  const [depForm] = Form.useForm();

  const [liaModalOpen, setLiaModalOpen] = useState(false);
  const [liaForm] = Form.useForm();

  const [holdModalOpen, setHoldModalOpen] = useState(false);
  const [editHolding, setEditHolding] = useState(null);
  const [holdForm] = Form.useForm();

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [acc, bal, deps, lias, holds, snaps] = await Promise.all([
        getAccount(id), getAccountBalance(id), getDeposits(id),
        getLiabilities(id), getHoldings(id), getSnapshots(id),
      ]);
      setAccount(acc); setBalance(bal); setDeposits(deps);
      setLiabilities(lias); setHoldings(holds); setSnapshots(snaps);
    } catch (err) {
      message.error('加载账户数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeposit = async () => {
    try {
      const values = await depForm.validateFields();
      const data = { ...values, account_id: parseInt(id), date: values.date ? values.date.toISOString() : new Date().toISOString() };
      await createDeposit(id, data);
      message.success('存款已添加');
      setDepModalOpen(false); depForm.resetFields(); loadAll();
    } catch (err) { if (err.response) message.error(err.response.data.detail || '操作失败'); }
  };

  const handleDeleteDeposit = async (depId) => {
    try { await deleteDeposit(depId); message.success('存款已删除'); loadAll(); }
    catch (err) { message.error('删除失败'); }
  };

  const handleAddLiability = async () => {
    try {
      const values = await liaForm.validateFields();
      const data = { ...values, account_id: parseInt(id), date: values.date ? values.date.toISOString() : new Date().toISOString() };
      await createLiability(id, data);
      message.success('负债已添加');
      setLiaModalOpen(false); liaForm.resetFields(); loadAll();
    } catch (err) { if (err.response) message.error(err.response.data.detail || '操作失败'); }
  };

  const handleDeleteLiability = async (liaId) => {
    try { await deleteLiability(liaId); message.success('负债已删除'); loadAll(); }
    catch (err) { message.error('删除失败'); }
  };

  const handleAddHolding = () => {
    setEditHolding(null); holdForm.resetFields();
    holdForm.setFieldsValue({ currency: account?.currency || 'CNY' });
    setHoldModalOpen(true);
  };

  const handleEditHolding = (record) => {
    setEditHolding(record); holdForm.setFieldsValue(record); setHoldModalOpen(true);
  };

  const handleSubmitHolding = async () => {
    try {
      const values = await holdForm.validateFields();
      if (editHolding) { await updateHolding(editHolding.id, values); message.success('持仓已更新'); }
      else { await createHolding(id, { ...values, account_id: parseInt(id) }); message.success('持仓已添加'); }
      setHoldModalOpen(false); holdForm.resetFields(); loadAll();
    } catch (err) { if (err.response) message.error(err.response.data.detail || '操作失败'); }
  };

  const handleDeleteHolding = async (holdId) => {
    try { await deleteHolding(holdId); message.success('持仓已删除'); loadAll(); }
    catch (err) { message.error('删除失败'); }
  };

  const chartData = snapshots.map((s) => ({
    date: dayjs(s.snapshot_date).format('MM-DD HH:mm'),
    balance: Math.round(s.balance * 100) / 100,
  }));

  // Holdings pie data
  const holdingsPieData = holdings.map(h => ({
    name: h.stock_name,
    value: Math.round(h.market_value * 100) / 100,
  }));

  const depositColumns = [
    {
      title: '金额', dataIndex: 'amount', key: 'amount',
      render: (v) => <span style={{ color: '#52c41a', fontWeight: 600 }}>+{v.toLocaleString()}</span>,
    },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '日期', dataIndex: 'date', key: 'date',
      render: (v) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: '操作', key: 'action', width: 80,
      render: (_, record) => (
        <Popconfirm title="确定删除？" onConfirm={() => handleDeleteDeposit(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  const liabilityColumns = [
    {
      title: '金额', dataIndex: 'amount', key: 'amount',
      render: (v) => <span style={{ color: '#ff4d4f', fontWeight: 600 }}>-{v.toLocaleString()}</span>,
    },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '日期', dataIndex: 'date', key: 'date',
      render: (v) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: '操作', key: 'action', width: 80,
      render: (_, record) => (
        <Popconfirm title="确定删除？" onConfirm={() => handleDeleteLiability(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  const holdingColumns = [
    {
      title: '股票', key: 'stock', render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.stock_name}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{r.stock_code}</div>
        </div>
      ),
    },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    {
      title: '成本价', dataIndex: 'cost_price', key: 'cost_price',
      render: (v) => v.toLocaleString(),
    },
    {
      title: '现价', dataIndex: 'current_price', key: 'current_price',
      render: (v) => v.toLocaleString(),
    },
    {
      title: '市值', dataIndex: 'market_value', key: 'market_value',
      render: (v) => <span style={{ fontWeight: 700 }}>{v.toLocaleString()}</span>,
    },
    {
      title: '盈亏', dataIndex: 'profit_loss', key: 'profit_loss',
      render: (v) => (
        <span className={v >= 0 ? 'balance-positive' : 'balance-negative'}>
          {v >= 0 ? '+' : ''}{v.toLocaleString()}
        </span>
      ),
    },
    {
      title: '操作', key: 'action', width: 100,
      render: (_, record) => (
        <Space size={0}>
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => handleEditHolding(record)} />
          <Popconfirm title="确定删除？" onConfirm={() => handleDeleteHolding(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!account) return null;

  const cur = currencyMap[account.currency] || '¥';

  const tabItems = [
    {
      key: 'deposits',
      label: <span><ArrowUpOutlined /> 存款记录</span>,
      children: (
        <div>
          <div style={{ marginBottom: 12 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { depForm.resetFields(); setDepModalOpen(true); }}
              style={{ borderRadius: 8 }}>
              添加存款
            </Button>
          </div>
          <Table columns={depositColumns} dataSource={deposits} rowKey="id" size="small" pagination={{ pageSize: 10 }} />
        </div>
      ),
    },
    {
      key: 'liabilities',
      label: <span><ArrowDownOutlined /> 负债记录</span>,
      children: (
        <div>
          <div style={{ marginBottom: 12 }}>
            <Button type="primary" danger icon={<PlusOutlined />} onClick={() => { liaForm.resetFields(); setLiaModalOpen(true); }}
              style={{ borderRadius: 8 }}>
              添加负债
            </Button>
          </div>
          <Table columns={liabilityColumns} dataSource={liabilities} rowKey="id" size="small" pagination={{ pageSize: 10 }} />
        </div>
      ),
    },
  ];

  if (account.account_type === 'brokerage') {
    tabItems.push({
      key: 'holdings',
      label: <span><StockOutlined /> 股票持仓</span>,
      children: (
        <Row gutter={20}>
          <Col span={holdings.length > 0 ? 16 : 24}>
            <div style={{ marginBottom: 12 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddHolding} style={{ borderRadius: 8 }}>
                添加持仓
              </Button>
            </div>
            <Table columns={holdingColumns} dataSource={holdings} rowKey="id" size="small" pagination={{ pageSize: 10 }} />
          </Col>
          {holdings.length > 0 && (
            <Col span={8}>
              <Card style={{ borderRadius: 12, border: '1px solid #f0f0f0' }} bodyStyle={{ padding: 16 }}>
                <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#595959' }}>
                  持仓占比
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={holdingsPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={40}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {holdingsPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={HOLDING_PIE_COLORS[index % HOLDING_PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${cur}${value.toLocaleString()}`, '市值']} />
                    <Legend
                      layout="vertical"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}
        </Row>
      ),
    });
  }

  tabItems.push({
    key: 'chart',
    label: <span><FundOutlined /> 余额趋势</span>,
    children: (
      <div className="chart-container">
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value) => [`${cur}${value}`, '余额']}
                contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0' }}
              />
              <Legend />
              <Line type="monotone" dataKey="balance" name="余额" stroke="#667eea" strokeWidth={2.5} dot={{ r: 4, fill: '#667eea' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: 60, color: '#bfbfbf' }}>
            <FundOutlined style={{ fontSize: 48, marginBottom: 12, display: 'block' }} />
            暂无足够的历史数据来生成趋势图，添加存款或负债后将自动记录余额快照
          </div>
        )}
      </div>
    ),
  });

  return (
    <div>
      {/* Back button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/accounts')}
        style={{ marginBottom: 16, color: '#595959', fontWeight: 500 }}
      >
        返回账户列表
      </Button>

      {/* Account Header with gradient */}
      <Card
        className="gradient-card stat-card"
        style={{ background: accountTypeGradient[account.account_type], border: 'none', marginBottom: 20 }}
        bodyStyle={{ padding: '24px 28px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar
              size={56}
              style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 14, fontSize: 26 }}
              icon={accountTypeIcon[account.account_type]}
            />
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{account.name}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <Tag style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: 6, margin: 0 }}>
                  {accountTypeMap[account.account_type]}
                </Tag>
                <Tag style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: 6, margin: 0 }}>
                  {account.currency}
                </Tag>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>当前余额</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: '42px' }}>
              {cur}{(balance?.balance || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Mini stat cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card style={{ borderRadius: 12, border: '1px solid #f0f0f0' }} bodyStyle={{ padding: '16px 20px' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}><ArrowUpOutlined style={{ color: '#52c41a' }} /> 总存款</span>}
              value={balance?.total_deposits || 0}
              prefix={cur}
              valueStyle={{ color: '#52c41a', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12, border: '1px solid #f0f0f0' }} bodyStyle={{ padding: '16px 20px' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}><ArrowDownOutlined style={{ color: '#ff4d4f' }} /> 总负债</span>}
              value={balance?.total_liabilities || 0}
              prefix={cur}
              valueStyle={{ color: '#ff4d4f', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12, border: '1px solid #f0f0f0' }} bodyStyle={{ padding: '16px 20px' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}><StockOutlined style={{ color: '#1677ff' }} /> 股票市值</span>}
              value={balance?.stock_market_value || 0}
              prefix={cur}
              valueStyle={{ color: '#1677ff', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card style={{ borderRadius: 12, border: '1px solid #f0f0f0' }} bodyStyle={{ padding: '8px 20px 20px' }}>
        <Tabs items={tabItems} size="large" />
      </Card>

      {/* Deposit Modal */}
      <Modal title="添加存款" open={depModalOpen} onOk={handleAddDeposit} onCancel={() => setDepModalOpen(false)} okText="确定" cancelText="取消">
        <Form form={depForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="输入存款金额" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="如：工资、转账等" />
          </Form.Item>
          <Form.Item name="date" label="日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Liability Modal */}
      <Modal title="添加负债" open={liaModalOpen} onOk={handleAddLiability} onCancel={() => setLiaModalOpen(false)} okText="确定" cancelText="取消">
        <Form form={liaForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="输入负债金额" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="如：信用卡、贷款等" />
          </Form.Item>
          <Form.Item name="date" label="日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Holding Modal */}
      <Modal title={editHolding ? '编辑持仓' : '添加持仓'} open={holdModalOpen} onOk={handleSubmitHolding} onCancel={() => setHoldModalOpen(false)} okText="确定" cancelText="取消" width={600}>
        <Form form={holdForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="stock_code" label="股票代码" rules={[{ required: true }]}>
                <Input placeholder="如：600519" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stock_name" label="股票名称" rules={[{ required: true }]}>
                <Input placeholder="如：贵州茅台" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="quantity" label="持仓数量" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="cost_price" label="成本价" rules={[{ required: true }]}>
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="current_price" label="现价" rules={[{ required: true }]}>
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="currency" label="币种">
            <Select>
              <Select.Option value="CNY">人民币 (CNY)</Select.Option>
              <Select.Option value="USD">美元 (USD)</Select.Option>
              <Select.Option value="HKD">港元 (HKD)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
