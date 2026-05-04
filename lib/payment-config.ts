// Payment configuration types and defaults
// This will eventually be replaced with database calls

export interface CryptoConfig {
  btc_address: string;
  eth_address: string;
  usdt_trc20: string;
  usdt_erc20: string;
}

export interface PayPalConfig {
  email: string;
}

export interface BankConfig {
  bank_name: string;
  account_name: string;
  account_number: string;
  swift_code: string;
  country: string;
}

export interface PaymentMethod {
  type: 'crypto' | 'paypal' | 'bank';
  status: 'active' | 'inactive';
  config: CryptoConfig | PayPalConfig | BankConfig;
  updated_at?: string;
}

export interface PaymentMethodsData {
  crypto: PaymentMethod & { config: CryptoConfig };
  paypal: PaymentMethod & { config: PayPalConfig };
  bank: PaymentMethod & { config: BankConfig };
}

// Default configuration (removed mock data - database-ready)
export const DEFAULT_PAYMENT_CONFIG: PaymentMethodsData = {
  crypto: {
    type: 'crypto',
    status: 'inactive',
    config: {
      btc_address: '',
      eth_address: '',
      usdt_trc20: '',
      usdt_erc20: '',
    },
    updated_at: new Date().toISOString(),
  },
  paypal: {
    type: 'paypal',
    status: 'inactive',
    config: {
      email: '',
    },
    updated_at: new Date().toISOString(),
  },
  bank: {
    type: 'bank',
    status: 'inactive',
    config: {
      bank_name: '',
      account_name: '',
      account_number: '',
      swift_code: '',
      country: '',
    },
    updated_at: new Date().toISOString(),
  },
};

// Get all payment methods
export async function getPaymentMethods(): Promise<PaymentMethodsData> {
  // TODO: Replace with database call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(DEFAULT_PAYMENT_CONFIG);
    }, 300);
  });
}

// Update crypto config
export async function updateCryptoConfig(config: Partial<CryptoConfig>): Promise<PaymentMethod> {
  // TODO: Replace with database call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        type: 'crypto',
        status: 'active',
        config: { ...DEFAULT_PAYMENT_CONFIG.crypto.config, ...config },
        updated_at: new Date().toISOString(),
      });
    }, 300);
  });
}

// Update PayPal config
export async function updatePayPalConfig(config: Partial<PayPalConfig>): Promise<PaymentMethod> {
  // TODO: Replace with database call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        type: 'paypal',
        status: 'active',
        config: { ...DEFAULT_PAYMENT_CONFIG.paypal.config, ...config },
        updated_at: new Date().toISOString(),
      });
    }, 300);
  });
}

// Update bank config
export async function updateBankConfig(config: Partial<BankConfig>): Promise<PaymentMethod> {
  // TODO: Replace with database call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        type: 'bank',
        status: 'active',
        config: { ...DEFAULT_PAYMENT_CONFIG.bank.config, ...config },
        updated_at: new Date().toISOString(),
      });
    }, 300);
  });
}

// Toggle payment method status
export async function togglePaymentMethod(type: 'crypto' | 'paypal' | 'bank'): Promise<PaymentMethod> {
  // TODO: Replace with database call
  const methods = DEFAULT_PAYMENT_CONFIG;
  const current = methods[type];
  const newStatus = current.status === 'active' ? 'inactive' : 'active';

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...current,
        status: newStatus,
        updated_at: new Date().toISOString(),
      });
    }, 300);
  });
}
