export interface PriceInfo {
  price: number;
  currency: string;
  priceFrom?: boolean;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  UAH: '₴',
};

export function formatPrice({ price, currency, priceFrom }: PriceInfo): string {
  const formattedNumber = price.toLocaleString('uk-UA');
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const prefix = priceFrom ? 'від ' : '';
  return `${prefix}${formattedNumber} ${symbol}`;
}
