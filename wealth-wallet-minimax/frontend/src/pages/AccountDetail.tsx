import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, Table, Tag, Button, Modal, Form, Input, InputNumber, Select, DatePicker, message, Popconfirm } from 'antd';
import {
  BankOutlined, FundOutlined, AuditOutlined, PlusOutlined, DeleteOutlined,
  RiseOutlined, FallOutlined, EditOutlined, HistoryOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getAccount, getTransactions, getHoldings, getAccountBalanceHistory,
  createTransaction, createHolding, deleteTransaction, deleteHolding, deleteAccount,
  Account, Transaction, StockHolding, BalanceHistory
} from '../api';

const typeIcons: Record<string, any> = {
  bank: <BankOutlined />,
  securities: <FundOutlined />,
  transit: <AuditOutlined />,
};

const currencySymbols: Record<string, string> = {
  CNY: '¥',
  USD: '$',
  HKD: 'HK$',
};

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const accountId = parseInt(id || '0');
  const [form] = Form.useForm();
  const [holdingForm] = Form.useForm();

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [holdingModalOpen, setHoldingModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [accountId]);

  const loadData = async () => {
    try {
      const [accountData, transactionsData, historyData] = await Promise.all([
        getAccount(accountId),
        getTransactions(accountId),
        getAccountBalanceHistory(accountId)
      ]);
      setAccount(accountData);
      setTransactions(transactionsData);
      setBalanceHistory(historyData);
      if (accountData.type === 'securities') {
        const holdingsData = await getHoldings(accountId);
        setHoldings(holdingsData);
      }
    } catch (error) {
      console.error('Failed to load account:', error);
      message.error('Failed to load account');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (values: any) => {
    try {
      await createTransaction(accountId, {
        type: values.type,
        amount: values.amount,
        description: values.description || '',
        date: values.date.format('YYYY-MM-DD')
      });
      message.success('Transaction added successfully');
      setTransactionModalOpen(false);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error('Failed to add transaction');
    }
  };

  const handleAddHolding = async (values: any) => {
    try {
      await createHolding(accountId, {
        symbol: values.symbol.toUpperCase(),
        name: values.name || '',
        quantity: values.quantity,
        cost_price: values.cost_price,
        current_price: values.current_price || 0
      });
      message.success('Stock holding added successfully');
      setHoldingModalOpen(false);
      holdingForm.resetFields();
      loadData();
    } catch (error) {
      message.error('Failed to add holding');
    }
  };

  const handleDeleteTransaction = async (txId: number) => {
    try {
      await deleteTransaction(txId);
      message.success('Transaction deleted');
      loadData();
    } catch (error) {
      message.error('Failed to delete transaction');
    }
  };

  const handleDeleteHolding = async (holdingId: number) => {
    try {
      await deleteHolding(holdingId);
      message.success('Holding deleted');
      loadData();
    } catch (error) {
      message.error('Failed to delete holding');
    }
  };

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: 'Delete Account',
      content: 'Are you sure you want to delete this account? All transactions will be lost.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteAccount(accountId);
          message.success('Account deleted');
          navigate('/');
        } catch (error) {
          message.error('Failed to delete account');
        }
      }
    });
  };

  const calculateHoldingProfit = (holding: StockHolding) => {
    return (holding.current_price - holding.cost_price) * holding.quantity;
  };

  const calculateHoldingProfitPercent = (holding: StockHolding) => {
    if (holding.cost_price === 0) return 0;
    return ((holding.current_price - holding.cost_price) / holding.cost_price) * 100;
  };

  if (loading) {
    return <Card loading className="shadow-lg" />;
  }

  if (!account) {
    return (
      <Card className="shadow-lg text-center py-12">
        <div className="text-gray-500 text-lg mb-4">Account not found</div>
        <Link to="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
      </Card>
    );
  }

  const transactionColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'deposit' ? 'green' : 'red'} icon={type === 'deposit' ? <RiseOutlined /> : <FallOutlined />}>
          {type.toUpperCase()}
        </Tag>
      )
    },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', 
      render: (amount: number) => (
        <span className={`font-semibold ${transactions.find(t => t.amount === amount) && 'text-green-600'}`}>
          ¥{amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Transaction) => (
        <Popconfirm
          title="Delete this transaction?"
          onConfirm={() => handleDeleteTransaction(record.id)}
          okText="Delete"
          cancelText="Cancel"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
        </Popconfirm>
      )
    }
  ];

  const holdingColumns = [
    { title: 'Symbol', dataIndex: 'symbol', key: 'symbol', 
      render: (text: string) => <Tag color="blue" className="font-mono font-bold">{text}</Tag> },
    { title: 'Name', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', 
      render: (qty: number) => qty.toLocaleString() },
    { title: 'Cost Price', dataIndex: 'cost_price', key: 'cost_price', 
      render: (price: number) => `$${price.toFixed(2)}` },
    { title: 'Current Price', dataIndex: 'current_price', key: 'current_price',
      render: (price: number) => `$${price.toFixed(2)}` },
    {
      title: 'P/L',
      key: 'profit',
      render: (_: any, record: StockHolding) => {
        const profit = calculateHoldingProfit(record);
        const profitPercent = calculateHoldingProfitPercent(record);
        return (
          <div className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
            <div className="font-semibold">{profit >= 0 ? '+' : ''}${profit.toFixed(2)}</div>
            <div className="text-xs">{profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%</div>
          </div>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: StockHolding) => (
        <Popconfirm
          title="Delete this holding?"
          onConfirm={() => handleDeleteHolding(record.id)}
          okText="Delete"
          cancelText="Cancel"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Account Header */}
      <Card className="shadow-lg" styles={{ body: { padding: '24px' } }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl text-white shadow-lg">
              {typeIcons[account.type] || <WalletOutlined />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{account.name}</h1>
              <div className="text-gray-400 capitalize">
                {account.type} Account • {account.currency}
              </div>
            </div>
          </div>
          <Button danger icon={<DeleteOutlined />} onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </div>
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
          <div className="text-sm text-gray-500 mb-1">Current Balance</div>
          <div className="text-4xl font-bold text-gray-900">
            {currencySymbols[account.currency]}{account.balance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </Card>

      {/* Balance Trend Chart */}
      {balanceHistory && balanceHistory.history.length > 0 && (
        <Card
          title={<span className="flex items-center gap-2"><HistoryOutlined /> Balance History</span>}
          className="shadow-lg"
          styles={{ body: { padding: '24px' } }}
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={balanceHistory.history}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1890ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#8c8c8c" />
              <YAxis tick={{ fontSize: 11 }} stroke="#8c8c8c" />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [`¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`, 'Balance']}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#1890ff"
                strokeWidth={3}
                fill="url(#balanceGradient)"
                dot={{ fill: '#1890ff', r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Stock Holdings (Securities only) */}
      {account.type === 'securities' && (
        <Card
          title={<span className="flex items-center gap-2"><FundOutlined /> Stock Holdings</span>}
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setHoldingModalOpen(true)}>
              Add Stock
            </Button>
          }
          className="shadow-lg"
          styles={{ body: { padding: '0' } }}
        >
          <Table
            dataSource={holdings}
            columns={holdingColumns}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: 'No stock holdings yet' }}
          />
        </Card>
      )}

      {/* Transactions */}
      <Card
        title={<span className="flex items-center gap-2"><HistoryOutlined /> Transactions</span>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setTransactionModalOpen(true)}>
            Add Transaction
          </Button>
        }
        className="shadow-lg"
        styles={{ body: { padding: '0' } }}
      >
        <Table
          dataSource={transactions}
          columns={transactionColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No transactions yet' }}
        />
      </Card>

      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
        ← Back to Dashboard
      </Link>

      {/* Transaction Modal */}
      <Modal
        title="Add Transaction"
        open={transactionModalOpen}
        onCancel={() => setTransactionModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddTransaction}>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="deposit">
                <Tag color="green" icon={<RiseOutlined />}>Deposit</Tag>
              </Select.Option>
              <Select.Option value="debt">
                <Tag color="red" icon={<FallOutlined />}>Debt</Tag>
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="¥" placeholder="0.00" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input placeholder="What is this transaction for?" />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Add Transaction</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Holding Modal */}
      <Modal
        title="Add Stock Holding"
        open={holdingModalOpen}
        onCancel={() => setHoldingModalOpen(false)}
        footer={null}
      >
        <Form form={holdingForm} layout="vertical" onFinish={handleAddHolding}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="symbol" label="Symbol" rules={[{ required: true }]}>
              <Input placeholder="AAPL" />
            </Form.Item>
            <Form.Item name="name" label="Name">
              <Input placeholder="Apple Inc." />
            </Form.Item>
            <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} precision={4} />
            </Form.Item>
            <Form.Item name="cost_price" label="Cost Price" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="$" />
            </Form.Item>
            <Form.Item name="current_price" label="Current Price">
              <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="$" />
            </Form.Item>
          </div>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Add Holding</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// Import WalletOutlined
import { WalletOutlined } from '@ant-design/icons';