/** Major U.S. banks for the claim transfer destination dropdown. */
export const US_BANKS = [
  'JPMorgan Chase Bank',
  'Bank of America',
  'Wells Fargo Bank',
  'Citibank',
  'U.S. Bank',
  'PNC Bank',
  'Truist Bank',
  'Capital One',
  'TD Bank',
  'Goldman Sachs Bank (Marcus)',
  'Charles Schwab Bank',
  'Fifth Third Bank',
  'Citizens Bank',
  'Ally Bank',
  'KeyBank',
  'Regions Bank',
  'M&T Bank',
  'Huntington National Bank',
  'American Express National Bank',
  'Navy Federal Credit Union',
  'USAA Federal Savings Bank',
  'Discover Bank',
  'BMO Bank',
  'HSBC Bank USA',
  'Other',
] as const;

export type AccountType = 'checking' | 'savings';

/** Methods the admin can require for paying the claim charges. */
export const FEE_PAYMENT_METHODS = [
  { value: 'card', label: 'Credit / Debit Card' },
  { value: 'bank', label: 'Bank Transfer (ACH)' },
  { value: 'wire', label: 'Wire Transfer' },
  { value: 'btc', label: 'Bitcoin (BTC)' },
  { value: 'usdt', label: 'USDT (Tether)' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'cashapp', label: 'Cash App' },
] as const;

export type FeePaymentMethod = (typeof FEE_PAYMENT_METHODS)[number]['value'];

export function feeMethodLabel(value: string): string {
  return FEE_PAYMENT_METHODS.find((m) => m.value === value)?.label ?? 'Card';
}
