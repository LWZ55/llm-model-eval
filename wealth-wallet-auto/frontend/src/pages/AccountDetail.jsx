import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Button, Tag, Popconfirm, Table, Row, Col, Statistic, Empty, Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  LineChartOutlined,
  SwapOutlined,
  StockOutlined,
  BankOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import {
  getAccount,
  createTransaction,
  deleteTransaction,
  createStockHolding,
  updateStockHolding,
  deleteStockHolding,
  getBalanceHistory,
} from '../api/client';
import TransactionForm from '../components/TransactionForm';
import StockForm from '../components/StockForm';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const TYPE_CONFIG = {
  bank: { label: 'Bank Account', icon: <BankOutlined />, color: 'purple' },
  broker: { label: 'Broker Account', icon: <StockOutlined />, color: 'cyan' },
  transit: { label: 'Transit Card', icon: <CreditCardOutlined />, color: 'green' },
};

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [history, setHistory] = useState([]);
  const [showTxForm, setShowTxForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [editingStock, setEditingStock] = useState(null);

  const fetchAll = async () => {
    const [accRes, histRes] = await Promise.all([
      getAccount(id),
      getBalanceHistory(id),
    ]);
    setAccount(accRes.data);
    setHistory(histRes.data.history);
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  if (!account) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text)' }}>Loading...</div>;

  const cfg = TYPE_CONFIG[account.type];

  const handleAddTransaction = async (data) => {
    await createTransaction(id, data);
    setShowTxForm(false);
    fetchAll();
  };

  const handleDeleteTransaction = async (txId) => {
    await deleteTransaction(txId);
    fetchAll();
  };

  const handleAddStock = async (data) => {
    await createStockHolding(id, data);
    setShowStockForm(false);
    fetchAll();
  };

  const handleUpdateStock = async (data) => {
    await updateStockHolding(editingStock.id, data);
    setEditingStock(null);
    fetchAll();
  };

  const handleDeleteStock = async (stockId) => {
    await deleteStockHolding(stockId);
    fetchAll();
  };

  const txColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'deposit' ? 'success' : 'error'} style={{ fontWeight: 600, textTransform: 'uppercase' }}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (v) => <span style={{ fontWeight: 600 }}>{v.toFixed(2)}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (d) => new Date(d).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Delete this transaction?"
          onConfirm={() => handleDeleteTransaction(record.id)}
          okText="Delete"
          okButtonProps={{ danger: true }}
        >
          <Button danger type="text" size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const stockColumns = [
    { title: 'Symbol', dataIndex: 'symbol', key: 'symbol', render: (v) => <span style={{ fontWeight: 700 }}>{v}</span> },
    { title: 'Shares', dataIndex: 'shares', key: 'shares' },
    { title: 'Avg Cost', dataIndex: 'avg_cost', key: 'avg_cost', render: (v) => v.toFixed(2) },
    { title: 'Current Price', dataIndex: 'current_price', key: 'current_price', render: (v) => v.toFixed(2) },
    {
      title: 'Value',
      key: 'value',
      render: (_, record) => <span style={{ fontWeight: 700, color: '#722ed1' }}>{(record.shares * record.current_price).toFixed(2)}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => { setEditingStock(record); setShowStockForm(false); }}
          />
          <Popconfirm
            title="Delete this holding?"
            onConfirm={() => handleDeleteStock(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button danger type="text" size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/accounts')}
        style={{ marginBottom: 16, color: 'var(--accent)' }}
      >
        Back to Accounts
      </Button>

      <Card bordered={false} style={{ marginBottom: 24, borderRadius: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#722ed1',
                fontSize: 26,
              }}
            >
              {cfg.icon}
            </div>
            <div>
              <h1 style={{ fontSize: 24, margin: 0 }}>{account.name}</h1>
              <div style={{ marginTop: 4 }}>
                <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>
                <Tag>{account.currency}</Tag>
              </div>
            </div>
          </div>
        </div>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={8}>
            <Statistic title="Balance" value={account.balance} precision={2} prefix={<BankOutlined />} />
          </Col>
          {account.stock_value > 0 && (
            <Col xs={24} sm={8}>
              <Statistic title="Stock Value" value={account.stock_value} precision={2} prefix={<StockOutlined />} valueStyle={{ color: '#13c2c2' }} />
            </Col>
          )}
          <Col xs={24} sm={8}>
            <Statistic title="Total" value={account.balance + account.stock_value} precision={2} prefix={<SwapOutlined />} valueStyle={{ color: '#722ed1', fontWeight: 700 }} />
          </Col>
        </Row>
      </Card>

      <Card
        title={<span><LineChartOutlined style={{ marginRight: 8, color: '#722ed1' }} />Balance History</span>}
        bordered={false}
        style={{ marginBottom: 24, borderRadius: 14 }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#bfbfbf" fontSize={12} />
            <YAxis stroke="#bfbfbf" fontSize={12} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #f0f0f0',
                boxShadow: 'var(--shadow)',
              }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#722ed1"
              strokeWidth={3}
              dot={{ r: 4, fill: '#722ed1', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card
        title={<span><SwapOutlined style={{ marginRight: 8, color: '#722ed1' }} />Transactions</span>}
        bordered={false}
        style={{ marginBottom: 24, borderRadius: 14 }}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowTxForm((s) => !s)}>
            {showTxForm ? 'Close' : 'Add'}
          </Button>
        }
      >
        {showTxForm && (
          <div style={{ marginBottom: 20, padding: 16, background: '#fafafa', borderRadius: 10 }}>
            <TransactionForm accountId={id} onSubmit={handleAddTransaction} onCancel={() => setShowTxForm(false)} />
          </div>
        )}
        <Table
          dataSource={account.transactions}
          columns={txColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: <Empty description="No transactions yet" /> }}
        />
      </Card>

      {account.type === 'broker' && (
        <Card
          title={<span><StockOutlined style={{ marginRight: 8, color: '#722ed1' }} />Stock Holdings</span>}
          bordered={false}
          style={{ borderRadius: 14 }}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { setShowStockForm((s) => !s); setEditingStock(null); }}
            >
              {showStockForm || editingStock ? 'Close' : 'Add Stock'}
            </Button>
          }
        >
          {(showStockForm || editingStock) && (
            <div style={{ marginBottom: 20, padding: 16, background: '#fafafa', borderRadius: 10 }}>
              <StockForm
                onSubmit={editingStock ? handleUpdateStock : handleAddStock}
                initialData={editingStock}
                onCancel={() => { setShowStockForm(false); setEditingStock(null); }}
              />
            </div>
          )}
          <Table
            dataSource={account.stock_holdings}
            columns={stockColumns}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: <Empty description="No stock holdings yet" /> }}
          />
        </Card>
      )}
    </div>
  );
}
