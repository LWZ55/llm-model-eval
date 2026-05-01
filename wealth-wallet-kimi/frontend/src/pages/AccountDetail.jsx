import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card, Button, Modal, Form, Input, Select, Table, Tag, Tabs, Space, Statistic, Row, Col, Popconfirm, Empty, Typography,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
} from 'recharts';
import {
  getAccount, getBalanceHistory, createTransaction, deleteTransaction,
  createHolding, updateHolding, deleteHolding,
} from '../api/client';

const { Title, Text } = Typography;
const { Option } = Select;

function AccountDetail() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [history, setHistory] = useState([]);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [holdingModalOpen, setHoldingModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [txForm] = Form.useForm();
  const [holdingForm] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [accRes, histRes] = await Promise.all([
        getAccount(id),
        getBalanceHistory(id),
      ]);
      setAccount(accRes.data);
      setHistory(histRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTxSubmit = async (values) => {
    try {
      await createTransaction({
        account_id: parseInt(id),
        ...values,
        amount: parseFloat(values.amount),
        date: new Date(values.date).toISOString(),
      });
      setTxModalOpen(false);
      txForm.resetFields();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTxDelete = async (txId) => {
    try {
      await deleteTransaction(txId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleHoldingSubmit = async (values) => {
    try {
      const payload = {
        account_id: parseInt(id),
        stock_code: values.stock_code,
        stock_name: values.stock_name,
        quantity: parseInt(values.quantity),
        avg_price: parseFloat(values.avg_price),
        current_price: parseFloat(values.current_price),
      };
      if (editingHolding) {
        await updateHolding(editingHolding.id, {
          quantity: payload.quantity,
          avg_price: payload.avg_price,
          current_price: payload.current_price,
        });
      } else {
        await createHolding(payload);
      }
      setHoldingModalOpen(false);
      setEditingHolding(null);
      holdingForm.resetFields();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleHoldingDelete = async (holdingId) => {
    try {
      await deleteHolding(holdingId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditHolding = (holding) => {
    setEditingHolding(holding);
    holdingForm.setFieldsValue({
      stock_code: holding.stock_code,
      stock_name: holding.stock_name,
      quantity: holding.quantity,
      avg_price: holding.avg_price,
      current_price: holding.current_price,
    });
    setHoldingModalOpen(true);
  };

  if (!account) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  const b = account.balance;

  const txColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (d) => new Date(d).toLocaleDateString(),
    },
    {
      title: 'Type',
      dataIndex: 'transaction_type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'deposit' ? 'green' : 'red'} icon={type === 'deposit' ? <RiseOutlined /> : <FallOutlined />}>
          {type === 'deposit' ? 'Deposit' : 'Liability'}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <Text strong style={{ color: record.transaction_type === 'deposit' ? '#52c41a' : '#f5222d' }}>
          {record.transaction_type === 'deposit' ? '+' : '-'}{amount.toFixed(2)}
        </Text>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (d) => d || '-',
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <Popconfirm
          title="Delete transaction?"
          onConfirm={() => handleTxDelete(record.id)}
          okText="Delete"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  const holdingColumns = [
    { title: 'Code', dataIndex: 'stock_code', key: 'code' },
    { title: 'Name', dataIndex: 'stock_name', key: 'name' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'qty' },
    {
      title: 'Avg Price',
      dataIndex: 'avg_price',
      key: 'avg',
      render: (v) => v.toFixed(2),
    },
    {
      title: 'Current Price',
      dataIndex: 'current_price',
      key: 'cur',
      render: (v) => v.toFixed(2),
    },
    {
      title: 'Market Value',
      key: 'mv',
      render: (_, record) => (record.quantity * record.current_price).toFixed(2),
    },
    {
      title: 'P/L',
      key: 'pl',
      render: (_, record) => {
        const pl = record.quantity * (record.current_price - record.avg_price);
        return (
          <Text strong style={{ color: pl >= 0 ? '#52c41a' : '#f5222d' }}>
            {pl >= 0 ? '+' : ''}{pl.toFixed(2)}
          </Text>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => openEditHolding(record)} />
          <Popconfirm
            title="Delete holding?"
            onConfirm={() => handleHoldingDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const typeColor = account.account_type === 'bank' ? 'blue' : account.account_type === 'broker' ? 'purple' : 'green';
  const typeLabel = account.account_type === 'bank' ? 'Bank' : account.account_type === 'broker' ? 'Broker' : 'Transport';

  return (
    <div>
      <Link to="/accounts" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#8c8c8c', marginBottom: 16 }}>
        <ArrowLeftOutlined />
        Back to Accounts
      </Link>

      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="top" gutter={[16, 16]}>
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={4} style={{ margin: 0 }}>{account.name}</Title>
              <Space>
                <Tag color={typeColor}>{typeLabel} Account</Tag>
                <Tag>{account.currency}</Tag>
              </Space>
            </Space>
          </Col>
          <Col>
            <Row gutter={[24, 8]}>
              <Col>
                <Statistic
                  title="Net Balance"
                  value={b.net_balance}
                  precision={2}
                  valueStyle={{ color: b.net_balance >= 0 ? '#52c41a' : '#f5222d' }}
                />
              </Col>
              {account.account_type === 'broker' && (
                <Col>
                  <Statistic
                    title="Stock Value"
                    value={b.stock_value}
                    precision={2}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
              )}
              <Col>
                <Statistic
                  title="Total Assets"
                  value={b.total_assets}
                  precision={2}
                  valueStyle={{ color: '#1677ff', fontWeight: 700 }}
                />
              </Col>
            </Row>
          </Col>
        </Row>

        <Row gutter={[24, 8]} style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
          <Col>
            <Statistic title="Total Deposit" value={b.total_deposit} precision={2} valueStyle={{ color: '#52c41a' }} />
          </Col>
          <Col>
            <Statistic title="Total Liability" value={b.total_liability} precision={2} valueStyle={{ color: '#f5222d' }} />
          </Col>
        </Row>
      </Card>

      {history.length > 0 && (
        <Card title="Balance History" style={{ marginBottom: 24 }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ReTooltip />
              <Line type="monotone" dataKey="balance" stroke="#1677ff" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Tabs
        defaultActiveKey="transactions"
        items={[
          {
            key: 'transactions',
            label: 'Transactions',
            children: (
              <Card
                title="Transactions"
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setTxModalOpen(true)}>
                    Add Transaction
                  </Button>
                }
              >
                {account.transactions.length === 0 ? (
                  <Empty description="No transactions yet" />
                ) : (
                  <Table
                    dataSource={account.transactions}
                    columns={txColumns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    size="middle"
                  />
                )}
              </Card>
            ),
          },
          ...(account.account_type === 'broker'
            ? [
                {
                  key: 'holdings',
                  label: 'Stock Holdings',
                  children: (
                    <Card
                      title="Stock Holdings"
                      extra={
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            setEditingHolding(null);
                            holdingForm.resetFields();
                            setHoldingModalOpen(true);
                          }}
                        >
                          Add Holding
                        </Button>
                      }
                    >
                      {account.holdings.length === 0 ? (
                        <Empty description="No stock holdings yet" />
                      ) : (
                        <Table
                          dataSource={account.holdings}
                          columns={holdingColumns}
                          rowKey="id"
                          pagination={false}
                          size="middle"
                        />
                      )}
                    </Card>
                  ),
                },
              ]
            : []),
        ]}
      />

      <Modal
        title="Add Transaction"
        open={txModalOpen}
        onCancel={() => setTxModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={txForm} layout="vertical" onFinish={handleTxSubmit}>
          <Form.Item label="Type" name="transaction_type" initialValue="deposit" rules={[{ required: true }]}>
            <Select>
              <Option value="deposit">Deposit</Option>
              <Option value="liability">Liability</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Amount" name="amount" rules={[{ required: true, message: 'Enter amount' }]}>
            <Input type="number" step="0.01" placeholder="0.00" />
          </Form.Item>
          <Form.Item label="Date" name="date" initialValue={new Date().toISOString().slice(0, 10)} rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input placeholder="Optional" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setTxModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Add Transaction</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingHolding ? 'Edit Holding' : 'Add Stock Holding'}
        open={holdingModalOpen}
        onCancel={() => {
          setHoldingModalOpen(false);
          setEditingHolding(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={holdingForm} layout="vertical" onFinish={handleHoldingSubmit}>
          <Form.Item label="Stock Code" name="stock_code" rules={[{ required: true }]}>
            <Input disabled={!!editingHolding} placeholder="e.g. 0700" />
          </Form.Item>
          <Form.Item label="Stock Name" name="stock_name" rules={[{ required: true }]}>
            <Input disabled={!!editingHolding} placeholder="e.g. Tencent" />
          </Form.Item>
          <Form.Item label="Quantity" name="quantity" rules={[{ required: true }]}>
            <Input type="number" placeholder="0" />
          </Form.Item>
          <Form.Item label="Average Price" name="avg_price" rules={[{ required: true }]}>
            <Input type="number" step="0.01" placeholder="0.00" />
          </Form.Item>
          <Form.Item label="Current Price" name="current_price" rules={[{ required: true }]}>
            <Input type="number" step="0.01" placeholder="0.00" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setHoldingModalOpen(false); setEditingHolding(null); }}>Cancel</Button>
              <Button type="primary" htmlType="submit">{editingHolding ? 'Update' : 'Add'}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AccountDetail;
