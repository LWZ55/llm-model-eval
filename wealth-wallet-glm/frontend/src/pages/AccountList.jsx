import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Input, Select, Tag, Space, message, Popconfirm, Avatar, Statistic } from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined,
  BankOutlined, StockOutlined, CreditCardOutlined,
  WalletOutlined, ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAccounts, getAccountsBalance, createAccount, deleteAccount, updateAccount } from '../services/api';

const accountTypeMap = { bank: '银行账户', brokerage: '券商账户', transit: '交通卡' };
const accountTypeColor = { bank: '#1677ff', brokerage: '#52c41a', transit: '#fa8c16' };
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
const currencyMap = { CNY: '¥', USD: '$', HKD: 'HK$' };

export default function AccountList() {
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const [data, bal] = await Promise.all([getAccounts(), getAccountsBalance()]);
      setAccounts(data);
      setBalances(bal);
    } catch (err) {
      message.error('加载账户失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditAccount(null);
    form.resetFields();
    form.setFieldsValue({ currency: 'CNY', account_type: 'bank' });
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditAccount(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editAccount) {
        await updateAccount(editAccount.id, values);
        message.success('账户已更新');
      } else {
        await createAccount(values);
        message.success('账户已创建');
      }
      setModalOpen(false);
      loadAccounts();
    } catch (err) {
      if (err.response) message.error(err.response.data.detail || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAccount(id);
      message.success('账户已删除');
      loadAccounts();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const getBalance = (accountId) => balances.find(b => b.id === accountId);

  return (
    <div>
      {/* Page Title */}
      <div className="page-title">
        <div className="title-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <WalletOutlined />
        </div>
        <div style={{ flex: 1 }}>
          <h2>账户管理</h2>
          <div className="subtitle">Account Management</div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
          style={{
            borderRadius: 10,
            height: 44,
            paddingLeft: 24,
            paddingRight: 24,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          }}
        >
          新建账户
        </Button>
      </div>

      {/* Account Cards Grid */}
      <Row gutter={[20, 20]}>
        {balances.map((bal) => {
          const acc = accounts.find(a => a.id === bal.id) || bal;
          const isBrokerage = acc.account_type === 'brokerage';
          return (
            <Col span={8} key={bal.id}>
              <Card
                className="account-card"
                loading={loading}
                bodyStyle={{ padding: 0 }}
                onClick={() => navigate(`/accounts/${bal.id}`)}
              >
                {/* Card Header with gradient */}
                <div style={{
                  background: accountTypeGradient[acc.account_type],
                  padding: '20px 20px 16px',
                  borderRadius: '12px 12px 0 0',
                  color: '#fff',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar
                        size={42}
                        style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10 }}
                        icon={accountTypeIcon[acc.account_type]}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{acc.name}</div>
                        <div style={{ opacity: 0.8, fontSize: 12, marginTop: 2 }}>
                          {accountTypeMap[acc.account_type]} · {acc.currency}
                        </div>
                      </div>
                    </div>
                    <Space size={4}>
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />}
                        onClick={(e) => { e.stopPropagation(); handleEdit(acc); }}
                      />
                      <Popconfirm title="确定删除此账户？" onConfirm={(e) => { e?.stopPropagation?.(); handleDelete(bal.id); }}>
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    </Space>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: '#8c8c8c' }}>当前余额</span>
                    <Tag color={accountTypeColor[acc.account_type]} className="account-tag" style={{ margin: 0 }}>
                      {acc.currency}
                    </Tag>
                  </div>
                  <div style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: bal.balance >= 0 ? '#1a1a2e' : '#ff4d4f',
                    marginBottom: 16,
                    lineHeight: '34px',
                  }}>
                    {currencyMap[acc.currency]}{bal.balance.toLocaleString()}
                  </div>

                  {/* Mini stats */}
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>存款</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#52c41a' }}>
                        <ArrowUpOutlined style={{ fontSize: 10 }} /> {currencyMap[acc.currency]}{bal.total_deposits.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>负债</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#ff4d4f' }}>
                        <ArrowDownOutlined style={{ fontSize: 10 }} /> {currencyMap[acc.currency]}{bal.total_liabilities.toLocaleString()}
                      </div>
                    </div>
                    {isBrokerage && (
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>持仓</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1677ff' }}>
                          {currencyMap[acc.currency]}{bal.stock_market_value.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Create/Edit Modal */}
      <Modal
        title={editAccount ? '编辑账户' : '新建账户'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="账户名称" rules={[{ required: true, message: '请输入账户名称' }]}>
            <Input placeholder="如：招商银行储蓄卡" />
          </Form.Item>
          <Form.Item name="account_type" label="账户类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="bank">
                <Space><BankOutlined style={{ color: '#1677ff' }} /> 银行账户</Space>
              </Select.Option>
              <Select.Option value="brokerage">
                <Space><StockOutlined style={{ color: '#52c41a' }} /> 券商账户</Space>
              </Select.Option>
              <Select.Option value="transit">
                <Space><CreditCardOutlined style={{ color: '#fa8c16' }} /> 交通卡</Space>
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="currency" label="币种" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="CNY">人民币 (CNY)</Select.Option>
              <Select.Option value="USD">美元 (USD)</Select.Option>
              <Select.Option value="HKD">港元 (HKD)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="账户描述（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
