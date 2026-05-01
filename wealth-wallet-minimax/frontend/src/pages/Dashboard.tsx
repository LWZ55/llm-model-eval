import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, Progress, Statistic } from 'antd';
import {
  BankOutlined,
  FundOutlined,
  AuditOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  TrophyOutlined,
  WalletOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { getDashboardSummary, getTotalBalanceHistory, DashboardSummary, BalanceHistoryItem } from '../api';

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

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryData, historyData] = await Promise.all([
        getDashboardSummary(),
        getTotalBalanceHistory()
      ]);
      setSummary(summaryData);
      setBalanceHistory(historyData.history);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPieData = () => {
    if (!summary?.accounts) return [];
    return summary.accounts.map((account, index) => ({
      name: account.name,
      value: Math.abs(account.balance_cny),
      currency: account.currency,
      rawBalance: account.balance,
      color: COLORS[index % COLORS.length],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Card loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-100 text-sm font-medium">
              <WalletOutlined />
              <span>Total Balance (CNY)</span>
            </div>
            <div className="text-5xl font-bold mt-2 drop-shadow-lg">
              ¥{summary?.total_balance_cny?.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <div className="mt-4 flex gap-4">
              <div className="flex items-center gap-1 text-xs text-blue-100">
                <DollarOutlined />
                <span>1 USD = ¥7.24</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-100">
                <DollarOutlined />
                <span>1 HKD = ¥0.92</span>
              </div>
            </div>
          </div>
          <div className="text-8xl opacity-20">
            <TrophyOutlined />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <PieChartOutlined />
              Account Distribution
            </span>
          }
          extra={<Link to="/accounts/new"><PlusOutlined /> Add Account</Link>}
          className="shadow-lg"
          styles={{ body: { padding: '24px' } }}
        >
          {getPieData().length > 0 ? (
            <div className="flex items-center">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={getPieData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {getPieData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`, 'Balance']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #f0f0f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3">
                {getPieData().map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <div className="font-medium text-gray-800">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.currency}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {currencySymbols[item.currency]}{item.rawBalance.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        ¥{item.value.toLocaleString('zh-CN', { minimumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <WalletOutlined style={{ fontSize: 48 }} />
              <div className="mt-2">No accounts yet</div>
            </div>
          )}
        </Card>

        {/* Balance Trend Chart */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <RiseOutlined style={{ color: '#52c41a' }} />
              Balance Trend (30 Days)
            </span>
          }
          className="shadow-lg"
          styles={{ body: { padding: '24px' } }}
        >
          {balanceHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={balanceHistory}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#colorBalance)"
                  dot={{ fill: '#1890ff', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, fill: '#1890ff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <RiseOutlined style={{ fontSize: 48 }} />
              <div className="mt-2">No balance history</div>
            </div>
          )}
        </Card>
      </div>

      {/* Accounts Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AuditOutlined style={{ color: '#1890ff' }} />
          Your Accounts
        </h2>
        {summary?.accounts && summary.accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.accounts.map((account, index) => (
              <Link
                key={account.id}
                to={`/accounts/${account.id}`}
                className="block group"
              >
                <Card
                  className="shadow-md hover:shadow-xl transition-all duration-300 border-0"
                  styles={{ body: { padding: '20px' } }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white"
                      style={{ background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]}, ${COLORS[index % COLORS.length]}aa)` }}
                    >
                      {typeIcons[account.type] || <WalletOutlined />}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-lg">{account.name}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">{account.type}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-sm text-gray-400">{account.currency}</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {currencySymbols[account.currency]}{account.balance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">≈ ¥{account.balance_cny.toLocaleString('zh-CN', { minimumFractionDigits: 0 })}</div>
                      <Progress
                        percent={Math.min(100, (account.balance_cny / (summary.total_balance_cny || 1)) * 100)}
                        size="small"
                        showInfo={false}
                        strokeColor={COLORS[index % COLORS.length]}
                        trailColor="#f0f0f0"
                      />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="shadow-lg text-center py-12">
            <div className="text-6xl mb-4 text-gray-300">
              <WalletOutlined />
            </div>
            <div className="text-gray-500 mb-4 text-lg">No accounts yet</div>
            <Link
              to="/accounts/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <PlusOutlined />
              Create Your First Account
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}

// Import PieChartOutlined from @ant-design/icons
import { PieChartOutlined } from '@ant-design/icons';