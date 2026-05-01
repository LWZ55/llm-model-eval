import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Radio, message } from 'antd';
import { BankOutlined, FundOutlined, AuditOutlined, CheckOutlined } from '@ant-design/icons';
import { createAccount } from '../api';

export default function NewAccount() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState<'bank' | 'securities' | 'transit'>('bank');
  const [currency, setCurrency] = useState<'CNY' | 'USD' | 'HKD'>('CNY');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createAccount({ name, type, currency });
      message.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      message.error('Failed to create account. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const accountTypes = [
    { value: 'bank', label: 'Bank', icon: <BankOutlined />, desc: 'Savings, checking, credit cards' },
    { value: 'securities', label: 'Securities', icon: <FundOutlined />, desc: 'Stocks, investment accounts' },
    { value: 'transit', label: 'Transit', icon: <AuditOutlined />, desc: 'Metro cards, transportation' },
  ];

  const currencies = [
    { value: 'CNY', label: '¥ CNY', desc: 'Chinese Yuan' },
    { value: 'USD', label: '$ USD', desc: 'US Dollar' },
    { value: 'HKD', label: 'HK$ HKD', desc: 'Hong Kong Dollar' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Account</h1>
        <p className="text-gray-500 mb-8">Add a new account to track your finances</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Account Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Account Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Bank Card, Interactive Brokers"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Account Type
            </label>
            <Radio.Group
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="grid grid-cols-3 gap-4"
            >
              {accountTypes.map((accType) => (
                <Radio.Button
                  key={accType.value}
                  value={accType.value}
                  className="!h-auto !px-4 !py-4 text-center !border-2 hover:!border-blue-400"
                  style={{
                    borderRadius: 12,
                    height: 'auto',
                    padding: '16px'
                  }}
                >
                  <div className={`text-4xl mb-2 ${type === accType.value ? 'scale-110' : ''}`}>
                    {accType.icon}
                  </div>
                  <div className="font-semibold text-base">{accType.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{accType.desc}</div>
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Currency
            </label>
            <Radio.Group
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="grid grid-cols-3 gap-4"
            >
              {currencies.map((curr) => (
                <Radio.Button
                  key={curr.value}
                  value={curr.value}
                  className="!h-auto !px-4 !py-4 text-center !border-2 hover:!border-blue-400"
                  style={{
                    borderRadius: 12,
                    height: 'auto',
                    padding: '12px 16px'
                  }}
                >
                  <div className="font-bold text-lg">{curr.label}</div>
                  <div className="text-xs text-gray-400">{curr.desc}</div>
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
            <div className="text-sm text-blue-600 mb-2">Preview</div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-2xl text-white">
                {type === 'bank' && <BankOutlined />}
                {type === 'securities' && <FundOutlined />}
                {type === 'transit' && <AuditOutlined />}
              </div>
              <div>
                <div className="font-bold text-gray-800 text-lg">{name || 'Account Name'}</div>
                <div className="text-sm text-gray-500 capitalize">{type} • {currency}</div>
              </div>
              <CheckOutlined className="text-green-500 text-xl ml-auto" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="flex-1 h-14 text-lg font-semibold"
            >
              Create Account
            </Button>
            <Link to="/">
              <Button size="large" className="px-8 h-14">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}