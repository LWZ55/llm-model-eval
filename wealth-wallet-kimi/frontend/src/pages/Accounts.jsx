import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Card, Button, Modal, Form, Input, Select, Tag, Popconfirm, Row, Col, Empty, Space, Typography,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  BankOutlined,
  StockOutlined,
  CarOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { getAccounts, createAccount, deleteAccount } from '../api/client';

const { Title } = Typography;
const { Option } = Select;

const typeConfig = {
  bank: { icon: <BankOutlined />, color: 'blue', label: 'Bank' },
  broker: { icon: <StockOutlined />, color: 'purple', label: 'Broker' },
  transport: { icon: <CarOutlined />, color: 'green', label: 'Transport' },
};

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await getAccounts();
      setAccounts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await createAccount(values);
      setIsModalOpen(false);
      form.resetFields();
      fetchAccounts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAccount(id);
      fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Accounts</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <Empty description="No accounts yet">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
              Add Account
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {accounts.map((account) => {
            const cfg = typeConfig[account.account_type] || typeConfig.bank;
            return (
              <Col xs={24} sm={12} lg={8} key={account.id}>
                <Card
                  hoverable
                  actions={[
                    <Link to={`/accounts/${account.id}`} key="view">
                      <Space>
                        View Details <ArrowRightOutlined />
                      </Space>
                    </Link>,
                    <Popconfirm
                      key="delete"
                      title="Delete this account?"
                      description="All transactions and holdings will be removed."
                      onConfirm={() => handleDelete(account.id)}
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                    >
                      <DeleteOutlined style={{ color: '#ff4d4f' }} />
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    avatar={
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: cfg.color === 'blue' ? '#e6f4ff' : cfg.color === 'purple' ? '#f9f0ff' : '#f6ffed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                          color: cfg.color === 'blue' ? '#1677ff' : cfg.color === 'purple' ? '#722ed1' : '#52c41a',
                        }}
                      >
                        {cfg.icon}
                      </div>
                    }
                    title={account.name}
                    description={
                      <Space direction="vertical" size={4} style={{ marginTop: 4 }}>
                        <Tag color={cfg.color}>{cfg.label} Account</Tag>
                        <Tag>{account.currency}</Tag>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Modal
        title="Add New Account"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Account Name"
            name="name"
            rules={[{ required: true, message: 'Please enter account name' }]}
          >
            <Input placeholder="e.g. ICBC Savings" />
          </Form.Item>
          <Form.Item
            label="Account Type"
            name="account_type"
            initialValue="bank"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="bank">Bank Account</Option>
              <Option value="broker">Broker Account</Option>
              <Option value="transport">Transport Card</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Currency"
            name="currency"
            initialValue="CNY"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="CNY">CNY - Chinese Yuan</Option>
              <Option value="USD">USD - US Dollar</Option>
              <Option value="HKD">HKD - Hong Kong Dollar</Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Account
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Accounts;
