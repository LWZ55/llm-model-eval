import {
  BankOutlined,
  CreditCardOutlined,
  StockOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import {
  AccountWithBalance,
  AccountType,
  accountTypeLabel,
  fmt,
} from '../api/client';

const ICON: Record<AccountType, JSX.Element> = {
  bank: <BankOutlined />,
  brokerage: <StockOutlined />,
  transit_card: <CreditCardOutlined />,
};

export default function AccountCard({ account }: { account: AccountWithBalance }) {
  const balance = parseFloat(account.balance);
  const sign = balance >= 0 ? 'pos' : 'neg';
  return (
    <Link to={`/accounts/${account.id}`} className="account-card">
      <div className="acc-head">
        <span className={`acc-icon ${account.type}`}>{ICON[account.type]}</span>
        <span className="ccy-tag">{account.currency}</span>
      </div>
      <div className="name">{account.name}</div>
      <div className="meta">{accountTypeLabel[account.type]}</div>
      <div className={`balance ${sign}`}>{fmt(account.balance, account.currency)}</div>
      {account.currency !== 'CNY' && (
        <div className="converted">≈ {fmt(account.balance_in_base, 'CNY')}</div>
      )}
    </Link>
  );
}
