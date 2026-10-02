/**
 * Strict integer minor units (Paise) money representation for Rural Kirana Store Accounts.
 * 1 Rupee = 100 Paise.
 * Never use binary floating-point for calculations.
 */

export type MoneyMinor = bigint;

export const Money = {
  zero: 0n,

  fromPaise(paise: number | string | bigint): MoneyMinor {
    if (typeof paise === 'bigint') return paise;
    const str = String(paise).trim();
    if (!str) return 0n;
    return BigInt(Math.round(Number(str)));
  },

  fromRupees(rupees: number | string): MoneyMinor {
    if (typeof rupees === 'number') {
      return BigInt(Math.round(rupees * 100));
    }
    const clean = rupees.replace(/[^0-9.-]/g, '').trim();
    if (!clean) return 0n;
    const num = parseFloat(clean);
    if (isNaN(num)) return 0n;
    return BigInt(Math.round(num * 100));
  },

  toRupees(amountMinor: MoneyMinor | number): number {
    const val = typeof amountMinor === 'bigint' ? Number(amountMinor) : amountMinor;
    return val / 100;
  },

  add(a: MoneyMinor, b: MoneyMinor): MoneyMinor {
    return a + b;
  },

  subtract(a: MoneyMinor, b: MoneyMinor): MoneyMinor {
    return a - b;
  },

  isPositive(a: MoneyMinor): boolean {
    return a > 0n;
  },

  isNegative(a: MoneyMinor): boolean {
    return a < 0n;
  },

  isZero(a: MoneyMinor): boolean {
    return a === 0n;
  },

  abs(a: MoneyMinor): MoneyMinor {
    return a < 0n ? -a : a;
  },
};

/**
 * Format minor units into Indian grouping currency string (e.g. ₹1,25,000 or ₹450.50).
 */
export function formatINR(
  amountMinor: MoneyMinor | number | string | null | undefined,
  options?: { showSymbol?: boolean; showDecimals?: boolean; signed?: boolean }
): string {
  if (amountMinor === null || amountMinor === undefined) {
    return options?.showSymbol !== false ? '₹0' : '0';
  }

  let minor: bigint;
  if (typeof amountMinor === 'bigint') {
    minor = amountMinor;
  } else {
    minor = Money.fromPaise(amountMinor);
  }

  const isNeg = minor < 0n;
  const absMinor = isNeg ? -minor : minor;

  const rupees = Number(absMinor / 100n);
  const paise = Number(absMinor % 100n);

  // Indian number grouping: last 3 digits, then groups of 2
  const rupeesStr = rupees.toString();
  let formattedRupees = '';
  if (rupeesStr.length <= 3) {
    formattedRupees = rupeesStr;
  } else {
    const lastThree = rupeesStr.substring(rupeesStr.length - 3);
    const rest = rupeesStr.substring(0, rupeesStr.length - 3);
    const withCommas = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formattedRupees = `${withCommas},${lastThree}`;
  }

  let result = formattedRupees;
  if (options?.showDecimals || paise > 0) {
    result += `.${paise.toString().padStart(2, '0')}`;
  }

  const prefix = options?.showSymbol !== false ? '₹' : '';
  if (isNeg) {
    return options?.signed ? `-${prefix}${result}` : `-${prefix}${result}`;
  } else if (options?.signed && minor > 0n) {
    return `+${prefix}${result}`;
  }
  return `${prefix}${result}`;
}
