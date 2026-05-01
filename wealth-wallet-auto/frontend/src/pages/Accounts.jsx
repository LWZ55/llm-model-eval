import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, List, Tag, Popconfirm, Empty, Row, Col } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  BankOutlined,
  StockOutlined,
  CreditCardOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { getAccounts, createAccount, deleteAccount } from '../api/client';
import AccountForm from '../components/AccountForm';

const TYPE_CONFIG = {
  bank: { label: 'Bank', icon: <BankOutlined />, color: 'purple' },
  broker: { label: 'Broker', icon: <StockOutlined />, color: 'cyan' },
  transit: { label: 'Transit', icon: <CreditCardOutlined />, color: 'green' },
};

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchAccounts = () => getAccounts().then((res) => setAccounts(res.data));

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreate = async (data) => {
    await createAccount(data);
    setShowForm(false);
    fetchAccounts();
  };

  const handleDelete = async (id) => {
    await deleteAccount(id);
    fetchAccounts();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28 }}>Accounts</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowForm((s) => !s)}
        >
          {showForm ? 'Close' : 'New Account'}
        </Button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 24, borderRadius: 14 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>New Account</h3>
          <AccountForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </Card>
      )}

      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
        dataSource={accounts}
        locale={{
          emptyText: (
            <Empty description="No accounts yet">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
                Create Account
              </Button>
            </Empty>
          ),
        }}
        renderItem={(acc) => {
          const cfg = TYPE_CONFIG[acc.type];
          return (
            <List.Item>
              <Card
                bordered={false}
                style={{ borderRadius: 14 }}
                actions={[
                  <Popconfirm
                    key="delete"
                    title="Delete this account?"
                    description="All data including transactions and stocks will be removed."
                    onConfirm={() => handleDelete(acc.id)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    cancelText="Cancel"
                  >
                    <Button danger type="text" icon={<DeleteOutlined />}>
                      Delete
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: 'var(--accent-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#722ed1',
                      fontSize: 22,
                    }}
                  >
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Link
                      to={`/accounts/${acc.id}`}
                      style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-h)' }}
                    >
                      {acc.name}
                    </Link>
                    <div style={{ marginTop: 4 }}>
                      <Tag color={cfg.color} icon={cfg.icon} style={{ fontSize: 12 }}>
                        {cfg.label}
                      </Tag>
                      <Tag style={{ fontSize: 12 }}>{acc.currency}</Tag>
                    </div>
                  </div>
                  <Row gutter={24} align="middle">
                    <Col>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: 'var(--text)' }}>Balance</div>
                        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-h)' }}>
                          {acc.balance.toFixed(2)}
                        </div>
                      </div>
                    </Col>
                    {acc.stock_value > 0 && (
                      <Col>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, color: 'var(--text)' }}>Stock Value</div>
                          <div style={{ fontWeight: 700, fontSize: 18, color: '#13c2c2' }}>
                            {acc.stock_value.toFixed(2)}
                          </div>
                        </div>
                      </Col>
                    )}
                    <Col>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: 'var(--text)' }}>Total</div>
                        <div style={{ fontWeight: 700, fontSize: 20, color: '#722ed1' }}>
                          {(acc.balance + acc.stock_value).toFixed(2)}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card>
            </List.Item>
          );
        }}
      />
    </div>
  );
}
