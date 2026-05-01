const currencySymbols = {
  CNY: '¥',
  USD: '$',
  HKD: 'HK$',
};

export const formatCurrency = (amount, currency = 'CNY') => {
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const getCurrencySymbol = (currency) => {
  return currencySymbols[currency] || currency;
};
