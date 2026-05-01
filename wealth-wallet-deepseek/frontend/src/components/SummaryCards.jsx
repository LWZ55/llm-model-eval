import {
  TrophyOutlined, ArrowUpOutlined, ArrowDownOutlined, WalletOutlined,
} from '@ant-design/icons';

const CURRENCY_SYMBOLS = { CNY: '¥', USD: '$', HKD: 'HK$' };

function formatCurrency(amount, currency = 'CNY') {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function SummaryCards({ summary }) {
  if (!summary) return null;

  return (
    <div className="summary-cards">
      <div className="summary-card net-worth">
        <div className="summary-card-icon"><TrophyOutlined /></div>
        <div className="summary-card-body">
          <div className="summary-card-label">Net Worth</div>
          <div className="summary-card-value">
            {formatCurrency(summary.total_balance)}
          </div>
        </div>
      </div>
      <div className="summary-card deposits">
        <div className="summary-card-icon"><ArrowUpOutlined /></div>
        <div className="summary-card-body">
          <div className="summary-card-label">Total Deposits</div>
          <div className="summary-card-value positive">
            {formatCurrency(summary.total_deposits)}
          </div>
        </div>
      </div>
      <div className="summary-card liabilities">
        <div className="summary-card-icon"><ArrowDownOutlined /></div>
        <div className="summary-card-body">
          <div className="summary-card-label">Total Liabilities</div>
          <div className="summary-card-value negative">
            {formatCurrency(summary.total_liabilities)}
          </div>
        </div>
      </div>
      <div className="summary-card accounts">
        <div className="summary-card-icon"><WalletOutlined /></div>
        <div className="summary-card-body">
          <div className="summary-card-label">Accounts</div>
          <div className="summary-card-value">{summary.accounts_count}</div>
        </div>
      </div>
    </div>
  );
}

export { formatCurrency };
export default SummaryCards;
